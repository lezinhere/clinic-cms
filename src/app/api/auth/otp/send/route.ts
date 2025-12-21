import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { phone } = await req.json();
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 5); // 5 mins

        await prisma.otp.upsert({
            where: { phone },
            update: { code, expiresAt },
            create: { phone, code, expiresAt }
        });

        // In a real app, integrate SMS service here.
        // For now, we simulate.
        console.log(`[SMS SIMULATION] To ${phone}: Your ClinicCMS OTP is ${code}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("API OTP Send Error:", error);
        return NextResponse.json({ success: false, error: "Failed to send OTP" }, { status: 500 });
    }
}
