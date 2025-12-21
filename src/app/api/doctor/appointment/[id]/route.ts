import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: { patient: true },
        });
        return NextResponse.json(appointment);
    } catch (error) {
        console.error("API GET Doctor Appointment Detail Error:", error);
        return NextResponse.json(null, { status: 500 });
    }
}
