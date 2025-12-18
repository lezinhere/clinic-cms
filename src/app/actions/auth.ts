"use server"

import { prisma } from "@/lib/db"
import { sendSMS } from "@/lib/sms"

export async function verifyStaffLogin(staffId: string, passcode: string) {
    try {
        const user = await prisma.user.findFirst({
            where: {
                id: staffId,
                role: { in: ["DOCTOR", "PHARMACY", "LAB", "ADMIN"] }
            }
        })

        if (!user) {
            return { success: false, error: "Staff user not found" }
        }

        const staffUser = user as any;

        if (staffUser.passcode !== passcode) {
            return { success: false, error: "Incorrect Passcode" }
        }

        return {
            success: true,
            user: {
                id: staffUser.id,
                name: staffUser.name,
                role: staffUser.role as any,
                phone: staffUser.phone || undefined,
                age: staffUser.age || undefined,
                sex: staffUser.sex || undefined,
                displayId: staffUser.displayId || undefined
            }
        }
    } catch (error) {
        console.error("Staff login error:", error)
        return { success: false, error: "Authentication failed" }
    }
}

export async function getStaffByRole(role: string) {
    try {
        return await prisma.user.findMany({
            where: { role },
            select: { id: true, name: true }
        })
    } catch (error) {
        return []
    }
}

export async function sendOTP(phone: string) {
    try {
        const randomCode = Math.floor(100000 + Math.random() * 900000).toString()
        const code = randomCode // Real SMS code

        const expiresAt = new Date(Date.now() + 1000 * 60 * 5) // 5 mins

        await (prisma as any).otp.upsert({
            where: { phone },
            update: { code, expiresAt },
            create: { phone, code, expiresAt }
        })

        // Send Real SMS
        await sendSMS(phone, `Your ClinicCMS Verification Code is: ${code}`)

        console.log(`[SMS SIMULATION] To ${phone}: Your ClinicCMS OTP is ${code}`)
        return { success: true }
    } catch (error) {
        console.error("OTP send failed:", error)
        return { success: false, error: "Failed to send OTP" }
    }
}

export async function verifyOTP(phone: string, code: string) {
    try {
        // Master OTP Bypass
        if (code === '123456') {
            // Bypass DB check
        } else {
            const otpRecord = await (prisma as any).otp.findUnique({
                where: { phone }
            })

            if (!otpRecord || otpRecord.code !== code) {
                return { success: false, error: "Invalid OTP" }
            }

            if (new Date() > new Date(otpRecord.expiresAt)) {
                return { success: false, error: "OTP expired" }
            }
        }

        // OTP Valid -> Find or Create Patient
        let user = await prisma.user.findFirst({
            where: { phone, role: "PATIENT" }
        })

        if (!user) {
            user = await (prisma.user as any).create({
                data: {
                    phone,
                    name: "Guest", // Default name for new registrations
                    role: "PATIENT",
                    displayId: `PID-NEW-${Date.now().toString().slice(-6)}`
                }
            })
        }

        // Delete OTP after successful use
        await (prisma as any).otp.delete({ where: { phone } })

        return {
            success: true,
            user: {
                id: (user as any).id,
                name: (user as any).name,
                role: (user as any).role as any,
                phone: (user as any).phone || undefined,
                displayId: (user as any).displayId || undefined
            }
        }
    } catch (error) {
        console.error("OTP verification failed:", error)
        return { success: false, error: "Verification failed" }
    }
}
