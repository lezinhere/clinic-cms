import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    try {
        const history = await prisma.labRequest.findMany({
            where: {
                status: "COMPLETED",
                ...(search ? {
                    OR: [
                        { consultation: { appointment: { patient: { name: { contains: search, mode: 'insensitive' } } } } },
                        { consultation: { appointment: { patient: { displayId: { contains: search, mode: 'insensitive' } } } } }
                    ]
                } : {})
            },
            include: {
                consultation: {
                    include: { appointment: { include: { patient: true, doctor: true } } }
                }
            },
            orderBy: { createdAt: "desc" },
            take: 50
        });
        return NextResponse.json(history);
    } catch (error) {
        console.error("API GET Lab History Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
