import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { staffId, passcode } = body;

        const user = await prisma.user.findFirst({
            where: {
                id: staffId,
                role: { in: ["DOCTOR", "PHARMACY", "LAB", "ADMIN"] }
            }
        });

        if (!user || user.passcode !== passcode) {
            return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                phone: user.phone,
                displayId: user.displayId
            }
        });
    } catch (error) {
        console.error("API Staff Login Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
