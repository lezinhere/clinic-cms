import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        console.log("API: Fetching appointment ID:", id); // SERVER LOG

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: true,
                doctor: true
            },
        });

        if (!appointment) {
            console.error("API: Appointment not found for ID:", id);
            return NextResponse.json({ error: "Not Found" }, { status: 404 });
        }

        return NextResponse.json(appointment);
    } catch (error: any) {
        console.error("API GET Doctor Appointment Detail Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
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
