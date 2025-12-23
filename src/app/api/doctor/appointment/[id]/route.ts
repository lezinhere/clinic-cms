import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: true,
                doctor: true
            },
        });
        return NextResponse.json(appointment);
    } catch (error) {
        console.error("API GET Doctor Appointment Detail Error:", error);
        return NextResponse.json(null, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        const body = await req.json(); // Safe parse
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: "Missing Status" }, { status: 400 });
        }

        const appointment = await prisma.appointment.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json(appointment);
    } catch (error: any) {
        console.error("API PATCH Doctor Appointment Error:", error);
        return NextResponse.json({
            error: "Failed to update",
            details: error?.message || "Unknown error"
        }, { status: 500 });
    }
}
