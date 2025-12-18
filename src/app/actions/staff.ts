"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

// Pharmacy Actions
export async function getPharmacyQueue() {
    try {
        const queue = await prisma.prescription.findMany({
            where: { isDispensed: false },
            include: {
                items: { include: { medicine: true } },
                consultation: {
                    include: { appointment: { include: { patient: true, doctor: true } } }
                }
            },
            orderBy: { createdAt: "asc" },
        })
        return queue
    } catch (error) {
        return []
    }
}

export async function dispensePrescription(id: string) {
    try {
        // Find a pharmacy user to attribute this action to
        const pharmacist = await prisma.user.findFirst({ where: { role: "PHARMACY" } })

        await prisma.prescription.update({
            where: { id },
            data: {
                isDispensed: true,
                dispensedById: pharmacist?.id || undefined // Use ID if found, else leave Relation null/undefined
            }
        })
        revalidatePath("/pharmacy/queue")
        return { success: true }
    } catch (error) {
        console.error("Dispense failed:", error)
        return { success: false }
    }
}

// Lab Actions
export async function getLabRequests() {
    try {
        const queue = await prisma.labRequest.findMany({
            where: { status: "PENDING" },
            include: {
                consultation: {
                    include: { appointment: { include: { patient: true, doctor: true } } }
                }
            },
            orderBy: { createdAt: "asc" },
        })
        return queue
    } catch (error) {
        return []
    }
}

export async function completeLabRequest(id: string, result: string) {
    try {
        // Find a lab user to attribute this action to
        const technician = await prisma.user.findFirst({ where: { role: "LAB" } })

        await prisma.labRequest.update({
            where: { id },
            data: {
                status: "COMPLETED",
                resultReport: result,
                technicianId: technician?.id || undefined
            }
        })
        revalidatePath("/lab/requests")
        return { success: true }
    } catch (error) {
        console.error("Lab complete failed:", error)
        return { success: false }
    }
}

export async function getPharmacyHistory(query: string = "") {
    const searchTerm = query.trim()
    try {
        const history = await prisma.prescription.findMany({
            where: {
                isDispensed: true,
                ...(searchTerm ? {
                    OR: [
                        { consultation: { appointment: { patient: { name: { contains: searchTerm } } } } },
                        { consultation: { appointment: { patient: { displayId: { contains: searchTerm } } } } }
                    ]
                } : {})
            },
            include: {
                items: { include: { medicine: true } },
                consultation: {
                    include: { appointment: { include: { patient: true, doctor: true } } }
                }
            },
            orderBy: { createdAt: "desc" },
            take: 50
        })
        return history
    } catch (error) {
        return []
    }
}

export async function getLabHistory(query: string = "") {
    const searchTerm = query.trim()
    try {
        const history = await prisma.labRequest.findMany({
            where: {
                status: "COMPLETED",
                ...(searchTerm ? {
                    OR: [
                        { consultation: { appointment: { patient: { name: { contains: searchTerm } } } } },
                        { consultation: { appointment: { patient: { displayId: { contains: searchTerm } } } } }
                    ]
                } : {})
            },
            include: {
                consultation: {
                    include: { appointment: { include: { patient: true, doctor: true } } }
                }
            },
            orderBy: { createdAt: "desc" },
            take: 50
        })
        return history
    } catch (error) {
        return []
    }
}
