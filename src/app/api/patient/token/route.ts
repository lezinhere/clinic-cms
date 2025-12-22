import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { doctorId, date, slotTime } = await req.json();

        if (!doctorId || !date || !slotTime) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Count existing appointments for this slot
        const count = await prisma.appointment.count({
            where: {
                doctorId,
                slotTime,
                // Match date loosely or strictly depending on how it's stored.
                // Best to store dates as 'YYYY-MM-DD' strings or start-of-day ISOs if exact match needed.
                // Assuming the backend stores exact ISOs from the input, we need to match the day.
                date: {
                    gte: new Date(date),
                    lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
                },
                status: { not: "CANCELLED" }
            }
        });

        // Next token is count + 1
        const nextToken = count + 1;

        return NextResponse.json({ token: nextToken });
    } catch (error: any) {
        console.error("API Token Preview Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
