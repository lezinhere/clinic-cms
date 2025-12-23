import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ doctorId: string }> }) {
    try {
        const { doctorId } = await params;
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId: doctorId,
                status: { in: ["PENDING", "CONFIRMED"] },
                date: { gte: startOfToday }
            },
            include: { patient: true },
            orderBy: { date: "asc" },
        });

        // Force mapping to ensure fields are present (Prisma sometimes has issues with optional scalars if not selected explicitly)
        // Although findMany should return them, let's be safe.
        const safeAppointments = appointments.map(apt => ({
            ...apt,
            patientName: apt.patientName, // Explicitly re-assign
            patientAge: apt.patientAge,
            patientGender: apt.patientGender
        }));

        console.log("Doctor Appointments [0]:", safeAppointments[0] ? JSON.stringify(safeAppointments[0], null, 2) : "None");
        return NextResponse.json(safeAppointments);
    } catch (error) {
        console.error("API GET Doctor Appointments Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
