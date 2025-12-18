"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getDoctorAppointments(doctorId: string) {
    try {
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId,
                status: { in: ["PENDING", "CONFIRMED"] },
                date: {
                    gte: startOfToday
                }
            },
            include: { patient: true },
            orderBy: { date: "asc" },
        })
        return appointments
    } catch (error) {
        return []
    }
}

export async function getDoctorConsultationHistory(doctorId: string, query: string = "") {
    const searchTerm = query.trim()
    try {
        const history = await prisma.appointment.findMany({
            where: {
                doctorId,
                status: "COMPLETED",
                ...(searchTerm ? {
                    OR: [
                        { patient: { name: { contains: searchTerm } } },
                        { patient: { displayId: { contains: searchTerm } } }
                    ]
                } : {})
            },
            include: {
                patient: true,
                consultation: true
            },
            orderBy: { date: "desc" },
            take: 50
        })
        return history
    } catch (error) {
        return []
    }
}

export async function getAppointmentDetails(id: string) {
    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: { patient: true },
        })
        return appointment
    } catch (error) {
        return null
    }
}

export async function searchMedicines(query: string) {
    if (!query) return []
    try {
        const meds = await prisma.medicine.findMany({
            where: {
                name: { contains: query }
            },
            orderBy: { usageCount: "desc" },
            take: 10
        })
        return meds
    } catch (error) {
        return []
    }
}

export async function searchLabTests(query: string) {
    if (!query) return []
    try {
        const tests = await prisma.labTest.findMany({
            where: {
                name: { contains: query }
            },
            orderBy: { usageCount: "desc" },
            take: 10
        })
        return tests
    } catch (error) {
        return []
    }
}

type PrescriptionInput = {
    medicineName: string
    dosage: string
    duration: string
}

type LabInput = {
    testName: string
}

export async function submitConsultation(
    appointmentId: string,
    diagnosis: string,
    notes: string,
    nextVisitDate: string | null, // Added parameter
    prescriptions: PrescriptionInput[],
    labRequests: LabInput[]
) {
    try {
        await prisma.$transaction(async (tx: any) => {
            // 1. Create Consultation
            const consultation = await tx.consultation.create({
                data: {
                    appointmentId,
                    diagnosis,
                    notes,
                    nextVisitDate: nextVisitDate ? new Date(nextVisitDate) : null, // Handle Date
                },
            })

            // 2. Handle Prescriptions
            if (prescriptions.length > 0) {
                const pres = await tx.prescription.create({
                    data: {
                        consultationId: consultation.id,
                    },
                })

                for (const p of prescriptions) {
                    // Dynamic Medicine Logic: Upsert
                    let medicine = await tx.medicine.findUnique({ where: { name: p.medicineName } })

                    if (medicine) {
                        medicine = await tx.medicine.update({
                            where: { id: medicine.id },
                            data: { usageCount: { increment: 1 } },
                        })
                    } else {
                        medicine = await tx.medicine.create({
                            data: {
                                name: p.medicineName,
                                usageCount: 1,
                            }
                        })
                    }

                    await tx.prescriptionItem.create({
                        data: {
                            prescriptionId: pres.id,
                            medicineId: medicine.id,
                            dosage: p.dosage,
                            duration: p.duration,
                        },
                    })
                }
            }

            // 3. Handle Lab Requests
            for (const l of labRequests) {
                // Dynamic Lab Test Logic
                await tx.labTest.upsert({
                    where: { name: l.testName },
                    update: { usageCount: { increment: 1 } },
                    create: { name: l.testName, usageCount: 1 }
                })

                await tx.labRequest.create({
                    data: {
                        consultationId: consultation.id,
                        testName: l.testName,
                        status: "PENDING",
                    },
                })
            }

            // 4. Update Appointment
            await tx.appointment.update({
                where: { id: appointmentId },
                data: { status: "COMPLETED" },
            })
        })

        revalidatePath("/doctor/dashboard")
        return { success: true }
    } catch (error: any) {
        console.error("Consultation submit error:", error)
        return { success: false, error: error.message || "Unknown error" }
    }
}
