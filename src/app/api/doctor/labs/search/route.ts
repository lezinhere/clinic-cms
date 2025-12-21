import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    if (!query) return NextResponse.json([]);

    try {
        const tests = await prisma.labTest.findMany({
            where: { name: { contains: query, mode: 'insensitive' } },
            orderBy: { usageCount: "desc" },
            take: 10
        });
        return NextResponse.json(tests);
    } catch (error) {
        console.error("API Lab Search Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
