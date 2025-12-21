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
        await prisma.$transaction(async (tx) => {
            // 1. Gather all linked appointments (Doctor OR Patient role)
            const doctorAppointments = await tx.appointment.findMany({ where: { doctorId: id } });
            const patientAppointments = await tx.appointment.findMany({ where: { patientId: id } });

            const allAppointments = [...doctorAppointments, ...patientAppointments];

            if (allAppointments.length > 0) {
                const apptIds = allAppointments.map(a => a.id);

                // Find linked consultations
                const consultations = await tx.consultation.findMany({
                    where: { appointmentId: { in: apptIds } }
                });
                const consultIds = consultations.map(c => c.id);

                if (consultIds.length > 0) {
                    // Delete Lab Requests linked to these consultations
                    await tx.labRequest.deleteMany({
                        where: { consultationId: { in: consultIds } }
                    });

                    // Delete Prescriptions linked to these consultations
                    const prescriptions = await tx.prescription.findMany({
                        where: { consultationId: { in: consultIds } }
                    });
                    const presIds = prescriptions.map(p => p.id);

                    if (presIds.length > 0) {
                        // Delete Prescription Items first
                        await tx.prescriptionItem.deleteMany({
                            where: { prescriptionId: { in: presIds } }
                        });
                        // Delete Prescriptions
                        await tx.prescription.deleteMany({
                            where: { id: { in: presIds } }
                        });
                    }

                    // Delete Consultations
                    await tx.consultation.deleteMany({
                        where: { id: { in: consultIds } }
                    });
                }

                // Delete Appointments
                await tx.appointment.deleteMany({
                    where: { id: { in: apptIds } }
                });
            }

            // 2. If PHARMACY/LAB: Nullify references in processed items
            // Unlink dispensed prescriptions
            await tx.prescription.updateMany({
                where: { dispensedById: id },
                data: { dispensedById: null }
            });

            // Unlink completed lab reports
            await tx.labRequest.updateMany({
                where: { technicianId: id },
                data: { technicianId: null }
            });

            // 3. Finally, Delete the User
            await tx.user.delete({
                where: { id }
            })
        })

        revalidatePath("/admin/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete staff:", error)
        return { success: false, error: "Failed to delete staff member: Data dependencies exist." }
    }
}
