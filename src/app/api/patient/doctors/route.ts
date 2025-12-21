import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const doctors = await prisma.user.findMany({
            where: { role: 'DOCTOR' },
            select: { id: true, name: true, specialization: true }
        });
        return NextResponse.json(doctors);
    } catch (error) {
        console.error("API GET Patient Doctors Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
