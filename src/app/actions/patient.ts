"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { sendSMS } from "@/lib/sms"

export async function getDoctors() {
    try {
        const doctors = await prisma.user.findMany({
            where: { role: "DOCTOR" },
        })
        return doctors
    } catch (error) {
        console.error("Failed to fetch doctors:", error)
        return []
    }
}

export async function bookAppointment(
    patientId: string | null, // Can be null for guests
    doctorId: string,
    date: Date,
    guestDetails?: { name: string, age: string, sex: string, phone: string }
) {
    try {
        let finalPatientId = patientId

        // If Guest (not logged in), find or create a user by phone
        if (!finalPatientId && guestDetails) {
            const existing = await prisma.user.findFirst({
                where: { phone: guestDetails.phone, role: "PATIENT" }
            })

            if (existing) {
                finalPatientId = existing.id
            } else {
                const newUser = await prisma.user.create({
                    data: {
                        name: guestDetails.name,
                        phone: guestDetails.phone,
                        age: parseInt(guestDetails.age),
                        sex: guestDetails.sex,
                        role: "PATIENT",
                        displayId: `PID-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`
                    }
                })
                finalPatientId = newUser.id
            }
        }

        if (!finalPatientId) throw new Error("No patient ID provided")

        // UPDATE PROFILE: If the user is currently "Guest" or incomplete, update them with the form details.
        if (finalPatientId && guestDetails) {
            const currentUser = await prisma.user.findUnique({ where: { id: finalPatientId } })
            if (currentUser && (currentUser.name === "Guest" || !currentUser.age || !currentUser.sex)) {
                await prisma.user.update({
                    where: { id: finalPatientId },
                    data: {
                        name: guestDetails.name,
                        age: parseInt(guestDetails.age),
                        sex: guestDetails.sex
                    }
                })
            }
        }

        await prisma.appointment.create({
            data: {
                patientId: finalPatientId,
                doctorId,
                date,
                status: "PENDING",
            },
        })
        revalidatePath("/patient/book")
        revalidatePath("/doctor/dashboard")

        // Send Booking Confirmation SMS
        if (guestDetails?.phone || finalPatientId) {
            // We need phone number. If guestDetails provided, use it. If logged in (finalPatientId), we might need to fetch user.
            // But we have 'patientId' arg. If patientId is provided, we didn't fetch the user object yet.
            // We should fetch patient phone if not available from guestDetails.

            let targetPhone = guestDetails?.phone
            if (!targetPhone) {
                const p = await prisma.user.findUnique({ where: { id: finalPatientId } })
                if (p) targetPhone = p.phone || undefined
            }

            if (targetPhone) {
                const msg = `Appointment Confirmed! Dr. ID: ${doctorId} on ${date.toLocaleDateString()}. Thank you for choosing ClinicCMS.`
                await sendSMS(targetPhone, msg)
            }
        }

        return { success: true }
    } catch (error: any) {
        console.error("Booking failed:", error)
        return { success: false, error: error.message || "Failed to book appointment" }
    }
}

export async function getPatientHistory(patientId: string) {
    try {
        const appointments = await prisma.appointment.findMany({
            where: { patientId },
            include: {
                doctor: true,
                consultation: {
                    include: {
                        prescriptions: { include: { items: { include: { medicine: true } } } },
                        labRequests: true,
                    },
                },
            },
            orderBy: { date: "desc" },
        })
        return appointments
    } catch (error) {
        return []
    }
}

export async function getPatientByPhone(phone: string) {
    try {
        const patient = await prisma.user.findFirst({
            where: { phone, role: "PATIENT" }
        })
        return patient
    } catch (error) {
        return null
    }
}

export async function updatePatientProfile(
    patientId: string,
    data: { name: string, age: number, sex: string }
) {
    try {
        const updated = await prisma.user.update({
            where: { id: patientId },
            data: {
                name: data.name,
                age: data.age,
                sex: data.sex,
            }
        })
        revalidatePath("/patient/profile")
        return { success: true, user: updated }
    } catch (error) {
        console.error("Profile update failed:", error)
        return { success: false, error: "Failed to update profile" }
    }
}
