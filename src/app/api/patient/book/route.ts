import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { patientId, doctorId, date, guestDetails } = body;

        let finalPatientId = patientId;

        if (!finalPatientId && guestDetails) {
            // Find or create guest user
            let user = await prisma.user.findFirst({
                where: { phone: guestDetails.phone, role: "PATIENT" }
            });

            if (!user) {
                user = await prisma.user.create({
                    data: {
                        name: guestDetails.name,
                        phone: guestDetails.phone,
                        age: parseInt(guestDetails.age),
                        sex: guestDetails.sex,
                        role: "PATIENT",
                        displayId: `PID-GUEST-${Date.now().toString().slice(-4)}`
                    }
                });
            }
            finalPatientId = user.id;
        }

        // Generate Token Number (Fix: Use MAX + 1 instead of COUNT to avoid duplicates)
        const lastAppointment = await prisma.appointment.findFirst({
            where: {
                doctorId,
                slotTime: body.slotTime,
                date: {
                    gte: new Date(date),
                    lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
                },
                status: { not: "CANCELLED" }
            },
            orderBy: { tokenNumber: 'desc' },
            select: { tokenNumber: true }
        });

        const tokenNumber = (lastAppointment?.tokenNumber || 0) + 1;

        const appointment = await prisma.appointment.create({
            data: {
                patientId: finalPatientId,
                doctorId,
                date: new Date(date),
                slotTime: body.slotTime,
                tokenNumber: tokenNumber,
                status: "PENDING",
                // Store actual patient details (Family Booking Support)
                patientName: guestDetails ? guestDetails.name : (body.patientName || null),
                patientAge: guestDetails ? parseInt(guestDetails.age) : (body.patientAge ? parseInt(body.patientAge) : null),
                patientGender: guestDetails ? guestDetails.sex : (body.patientGender || null)
            },
            include: {
                patient: true,
                doctor: true
            }
        });

        // Send SMS
        try {
            const { sendSMS } = require('@/lib/sms'); // Dynamic import to avoid build issues if lib missing
            const message = `Booking Confirmed!\nToken: ${tokenNumber}\nDoctor: ${appointment.doctor.name}\nTime: ${body.slotTime}\nDate: ${new Date(date).toLocaleDateString()}`;
            await sendSMS(appointment.patient.phone, message);
        } catch (smsError) {
            console.error("Failed to send booking SMS:", smsError);
        }

        return NextResponse.json({ success: true, appointment });
    } catch (error: any) {
        console.error("API Patient Book Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
