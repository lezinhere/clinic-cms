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

        // Generate Token Number
        const count = await prisma.appointment.count({
            where: {
                doctorId,
                slotTime: body.slotTime, // Ensure slotTime is passed in body
                date: {
                    gte: new Date(date),
                    lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
                },
                status: { not: "CANCELLED" }
            }
        });
        const tokenNumber = count + 1;

        const appointment = await prisma.appointment.create({
            data: {
                patientId: finalPatientId,
                doctorId,
                date: new Date(date),
                slotTime: body.slotTime,
                tokenNumber: tokenNumber,
                status: "PENDING"
            }
        });

        return NextResponse.json({ success: true, appointment });
    } catch (error: any) {
        console.error("API Patient Book Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
