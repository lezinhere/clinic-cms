import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ role: string }> }) {
    try {
        const { role } = await params;
        const upperRole = role.toUpperCase();

        const staff = await prisma.user.findMany({
            where: { role: upperRole },
            select: { id: true, name: true }
        });

        return NextResponse.json(staff);
    } catch (error) {
        console.error("API GET Staff by Role Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
