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

        const appointment = await prisma.appointment.create({
            data: {
                patientId: finalPatientId,
                doctorId,
                date: new Date(date),
                status: "PENDING"
            }
        });

        return NextResponse.json({ success: true, appointment });
    } catch (error: any) {
        console.error("API Patient Book Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
