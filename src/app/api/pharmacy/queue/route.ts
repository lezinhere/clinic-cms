import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const queue = await prisma.prescription.findMany({
            where: {
                isDispensed: false,
                consultation: {
                    appointment: {
                        queueStatus: "PHARMACY"
                    }
                }
            },
            include: {
                items: { include: { medicine: true } },
                consultation: {
                    include: { appointment: { include: { patient: true, doctor: true } } }
                }
            },
            orderBy: { createdAt: "asc" },
        });
        return NextResponse.json(queue);
    } catch (error) {
        console.error("API GET Pharmacy Queue Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
