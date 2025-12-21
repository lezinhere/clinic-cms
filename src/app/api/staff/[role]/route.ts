import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';

export async function GET(req: Request, { params }: { params: Promise<{ role: string }> }) {
    try {
        const { role } = await params;

        // Validate role against Prisma Enum if needed, or just let Prisma filter
        // The original code uses req.params.role.toUpperCase()
        const upperRole = role.toUpperCase() as Role;

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
