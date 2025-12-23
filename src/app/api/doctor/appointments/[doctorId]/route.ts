import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ doctorId: string }> }) {
    try {
        const { doctorId } = await params;
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId: doctorId,
                status: { in: ["PENDING", "CONFIRMED"] },
                date: { gte: startOfToday }
            },
            // Explicitly select fields to debug why scalars are missing
            select: {
                id: true,
                patientId: true,
                doctorId: true,
                date: true,
                status: true,
                slotTime: true,
                tokenNumber: true,
                patientName: true, // This is the critical field
                patientAge: true,
                patientGender: true,
                queueStatus: true,
                patient: {
                    select: {
                        id: true,
                        name: true,
                        age: true,
                        sex: true,
                        phone: true,
                        displayId: true
                    }
                }
            },
            orderBy: { date: "asc" },
        });

        // Debug Log: Raw Object from Prisma (First Item Only)
        if (appointments.length > 0) {
            console.log("DEBUG RAW PRISMA RESULT [0]:", JSON.stringify(appointments[0], null, 2));
            console.log("DEBUG KEYS:", Object.keys(appointments[0]));
        }

        // Force mapping to ensure fields are present (Prisma sometimes has issues with optional scalars if not selected explicitly)
        // Although findMany should return them, let's be safe.
        const safeAppointments = appointments.map(apt => ({
            ...apt,
            patientName: apt.patientName, // Explicitly re-assign
            patientAge: apt.patientAge,
            patientGender: apt.patientGender
        }));

        console.log("Doctor Appointments [0]:", safeAppointments[0] ? JSON.stringify(safeAppointments[0], null, 2) : "None");
        return NextResponse.json(safeAppointments);
    } catch (error) {
        console.error("API GET Doctor Appointments Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
