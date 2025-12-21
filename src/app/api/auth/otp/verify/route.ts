import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { phone, code } = await req.json();

        // Master OTP Bypass
        if (code === '123456') {
            // Allow 123456 explicitly, skipping DB check
        } else {
            const otpRecord = await prisma.otp.findUnique({ where: { phone } });

            if (!otpRecord || otpRecord.code !== code) {
                return NextResponse.json({ success: false, error: "Invalid OTP" }, { status: 401 });
            }

            if (new Date() > new Date(otpRecord.expiresAt)) {
                return NextResponse.json({ success: false, error: "OTP expired" }, { status: 401 });
            }
        }

        let user = await prisma.user.findFirst({ where: { phone, role: "PATIENT" } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    phone,
                    name: "Guest",
                    role: "PATIENT",
                    displayId: `PID-NEW-${Date.now().toString().slice(-6)}`
                }
            });
        }

        // Cleanup OTP
        await prisma.otp.deleteMany({ where: { phone } });

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
        console.error("API OTP Verify Error:", error);
        return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
    }
}
