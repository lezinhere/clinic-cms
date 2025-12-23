import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { appointmentId, diagnosis, notes, nextVisitDate, prescriptions, labRequests } = body;

        await prisma.$transaction(async (tx) => {
            // 1. Create Consultation
            const consultation = await tx.consultation.create({
                data: {
                    appointmentId,
                    diagnosis,
                    notes,
                    nextVisitDate: nextVisitDate ? new Date(nextVisitDate) : null,
                },
            });

            // 2. Handle Prescriptions
            if (prescriptions && prescriptions.length > 0) {
                const pres = await tx.prescription.create({
                    data: { consultationId: consultation.id },
                });

                for (const p of prescriptions) {
                    let medicine = await tx.medicine.findUnique({ where: { name: p.medicineName } });

                    if (medicine) {
                        medicine = await tx.medicine.update({
                            where: { id: medicine.id },
                            data: { usageCount: { increment: 1 } },
                        });
                    } else {
                        medicine = await tx.medicine.create({
                            data: { name: p.medicineName, usageCount: 1 }
                        });
                    }

                    await tx.prescriptionItem.create({
                        data: {
                            prescriptionId: pres.id,
                            medicineId: medicine.id,
                            dosage: p.dosage,
                            duration: p.duration,
                        },
                    });
                }
            }

            // 3. Handle Lab Requests
            if (labRequests && labRequests.length > 0) {
                for (const l of labRequests) {
                    await tx.labTest.upsert({
                        where: { name: l.testName },
                        update: { usageCount: { increment: 1 } },
                        create: { name: l.testName, usageCount: 1 }
                    });

                    await tx.labRequest.create({
                        data: {
                            consultationId: consultation.id,
                            testName: l.testName,
                            status: "PENDING",
                        },
                    });
                }
            }

            // 4. Update Appointment
            await tx.appointment.update({
                where: { id: appointmentId },
                data: {
                    status: "COMPLETED",
                    queueStatus: (prescriptions && prescriptions.length > 0) ? "PHARMACY" : "COMPLETED"
                },
            });
        }, {
            maxWait: 5000,
            timeout: 20000
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API Doctor Consult Submit CRITICAL Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Server Transaction Failed" }, { status: 500 });
    }
}
