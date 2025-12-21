import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ doctorId: string }> }) {
    try {
        const { doctorId } = await params;
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');

        const history = await prisma.appointment.findMany({
            where: {
                doctorId: doctorId,
                status: "COMPLETED",
                OR: search ? [
                    { patient: { name: { contains: search, mode: 'insensitive' } } },
                    { patient: { displayId: { contains: search, mode: 'insensitive' } } },
                ] : undefined
            },
            include: { patient: true, consultation: true },
            orderBy: { date: "desc" },
        });
        return NextResponse.json(history);
    } catch (error) {
        console.error("API GET Doctor History Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
