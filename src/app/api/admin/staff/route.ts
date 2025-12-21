import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/admin/staff - List all staff
export async function GET() {
    try {
        const staff = await prisma.user.findMany({
            where: {
                role: { in: ["DOCTOR", "PHARMACY", "LAB", "ADMIN"] }
            },
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(staff);
    } catch (error) {
        console.error("API GET Staff Error:", error);
        return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
    }
}

// POST /api/admin/staff - Create new staff
export async function POST(req: Request) {
    try {
        const data = await req.json();
        const newUser = await prisma.user.create({
            data: {
                name: data.name,
                role: data.role,
                specialization: data.specialization || null,
                passcode: data.passcode,
                displayId: data.displayId
            }
        });
        return NextResponse.json({ success: true, user: newUser });
    } catch (error: any) {
        console.error("API POST Staff Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Creation failed" }, { status: 500 });
    }
}
