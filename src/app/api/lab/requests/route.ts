import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const requests = await prisma.labRequest.findMany({
            where: { status: "PENDING" },
            include: {
                consultation: {
                    include: { appointment: { include: { patient: true, doctor: true } } }
                }
            },
            orderBy: { createdAt: "asc" },
        });
        return NextResponse.json(requests);
    } catch (error) {
        console.error("API GET Lab Requests Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
