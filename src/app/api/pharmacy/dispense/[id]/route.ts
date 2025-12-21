import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { staffId } = body;

        await prisma.prescription.update({
            where: { id },
            data: { isDispensed: true, dispensedById: staffId }
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API Pharmacy Dispense Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
