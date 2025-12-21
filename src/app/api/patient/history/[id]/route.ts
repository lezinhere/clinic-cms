import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const history = await prisma.appointment.findMany({
            where: { patientId: id },
            include: {
                doctor: { select: { name: true } },
                consultation: {
                    include: {
                        prescriptions: { include: { items: { include: { medicine: true } } } },
                        labRequests: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(history);
    } catch (error) {
        console.error("API GET Patient History Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
