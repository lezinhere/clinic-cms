import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { result, staffId } = body;

        await prisma.labRequest.update({
            where: { id },
            data: {
                status: "COMPLETED",
                resultReport: result,
                technicianId: staffId
            }
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API Lab Complete Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
