import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PUT /api/admin/staff/[id] - Update staff
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const data = await req.json();

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.role && { role: data.role }),
                ...(data.specialization !== undefined && { specialization: data.specialization }),
                ...(data.passcode && { passcode: data.passcode }),
                ...(data.displayId && { displayId: data.displayId }),
            }
        });
        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error: any) {
        console.error("API UPDATE Staff Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Update failed" }, { status: 500 });
    }
}

// DELETE /api/admin/staff/[id] - Delete staff with Cascade
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        await prisma.$transaction(async (tx) => {
            // 1. Gather all linked appointments (Doctor OR Patient role)
            const doctorAppointments = await tx.appointment.findMany({ where: { doctorId: id } });
            const patientAppointments = await tx.appointment.findMany({ where: { patientId: id } });

            // deduplicate IDs just in case
            const allAppointments = [...doctorAppointments, ...patientAppointments];
            // unique IDs
            const apptIds = Array.from(new Set(allAppointments.map(a => a.id)));

            if (apptIds.length > 0) {
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
            });
        }, {
            maxWait: 5000,
            timeout: 20000
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API DELETE Staff Error:", error);
        return NextResponse.json({
            success: false,
            error: `Delete Failed: ${error.message || "Unknown error"}`
        }, { status: 500 });
    }
}
