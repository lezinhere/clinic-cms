import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
        return NextResponse.json(appointments);
    } catch (error) {
        console.error("API GET Doctor Appointments Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
