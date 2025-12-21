import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    if (!query) return NextResponse.json([]);

    try {
        const meds = await prisma.medicine.findMany({
            where: { name: { contains: query, mode: 'insensitive' } },
            orderBy: { usageCount: "desc" },
            take: 10
        });
        return NextResponse.json(meds);
    } catch (error) {
        console.error("API Medicine Search Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
