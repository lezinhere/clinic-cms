
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const appointment = await prisma.appointment.findFirst({
            orderBy: { createdAt: 'desc' },
            include: { patient: true }
        });

        if (!appointment) {
            return NextResponse.json({ message: "No appointments found" });
        }

        return NextResponse.json({
            meta: {
                message: "This is a raw dump of the latest appointment",
                generatedAt: new Date().toISOString()
            },
            appointment
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
