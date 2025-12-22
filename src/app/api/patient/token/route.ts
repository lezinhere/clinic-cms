import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { doctorId, date, slotTime } = await req.json();

        if (!doctorId || !date || !slotTime) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Find last token for this slot
        const lastAppointment = await prisma.appointment.findFirst({
            where: {
                doctorId,
                slotTime,
                date: {
                    gte: new Date(date),
                    lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
                },
                status: { not: "CANCELLED" }
            },
            orderBy: { tokenNumber: 'desc' },
            select: { tokenNumber: true }
        });

        // Next token is max + 1
        const nextToken = (lastAppointment?.tokenNumber || 0) + 1;

        return NextResponse.json({ token: nextToken });
    } catch (error: any) {
        console.error("API Token Preview Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
