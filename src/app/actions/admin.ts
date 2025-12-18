"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getAllStaff() {
    try {
        return await prisma.user.findMany({
            where: {
                role: { in: ["DOCTOR", "PHARMACY", "LAB", "ADMIN"] }
            },
            orderBy: { createdAt: "desc" }
        })
    } catch (error) {
        console.error("Failed to fetch staff:", error)
        return []
    }
}

export async function createStaffMember(data: {
    name: string,
    role: string,
    specialization?: string,
    passcode: string,
    displayId: string
}) {
    try {
        const newUser = await (prisma.user as any).create({
            data: {
                name: data.name,
                role: data.role,
                specialization: data.specialization || null,
                passcode: data.passcode,
                displayId: data.displayId
            }
        })
        revalidatePath("/admin/dashboard")
        return { success: true, user: newUser }
    } catch (error) {
        console.error("Failed to create staff:", error)
        return { success: false, error: "Failed to create staff member" }
    }
}

export async function updateStaffMember(id: string, data: {
    name?: string,
    role?: string,
    specialization?: string,
    passcode?: string,
    displayId?: string
}) {
    try {
        const updatedUser = await (prisma.user as any).update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.role && { role: data.role }),
                ...(data.specialization !== undefined && { specialization: data.specialization }),
                ...(data.passcode && { passcode: data.passcode }),
                ...(data.displayId && { displayId: data.displayId }),
            }
        })
        revalidatePath("/admin/dashboard")
        return { success: true, user: updatedUser }
    } catch (error) {
        console.error("Failed to update staff:", error)
        return { success: false, error: "Failed to update staff member" }
    }
}

export async function deleteStaffMember(id: string) {
    try {
        await prisma.user.delete({
            where: { id }
        })
        revalidatePath("/admin/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete staff:", error)
        return { success: false, error: "Failed to delete staff member" }
    }
}
