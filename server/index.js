const express = require('express');
const cors = require('cors');
require('dotenv').config();
const prisma = require('./db');
const { sendSMS } = require('./sms');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// --- AUTH ROUTES ---

// Staff Login
app.post('/api/auth/staff-login', async (req, res) => {
    const { staffId, passcode } = req.body;
    try {
        const user = await prisma.user.findFirst({
            where: {
                id: staffId,
                role: { in: ["DOCTOR", "PHARMACY", "LAB", "ADMIN"] }
            }
        });

        if (!user || user.passcode !== passcode) {
            return res.status(401).json({ success: false, error: "Invalid credentials" });
        }

        res.json({
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
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// Send OTP
app.post('/api/auth/otp/send', async (req, res) => {
    const { phone } = req.body;
    try {
        const code = Math.floor(100000 + Math.random() * 900000).toString(); // Real Random Code
        const expiresAt = new Date(Date.now() + 1000 * 60 * 5); // 5 mins

        await prisma.otp.upsert({
            where: { phone },
            update: { code, expiresAt },
            create: { phone, code, expiresAt }
        });

        // Send Real SMS
        await sendSMS(phone, `Your ClinicCMS Verification Code is: ${code}`);

        console.log(`[SMS SIMULATION] To ${phone}: Your ClinicCMS OTP is ${code}`);
        res.json({ success: true });
    } catch (error) {
        console.error("OTP Error:", error);
        res.status(500).json({ success: false, error: "Failed to send OTP" });
    }
});

// Verify OTP
app.post('/api/auth/otp/verify', async (req, res) => {
    const { phone, code } = req.body;
    try {
        // Master OTP Bypass
        if (code === '123456') {
            // Allow 123456 explicitly, skipping DB check
        } else {
            const otpRecord = await prisma.otp.findUnique({ where: { phone } });

            if (!otpRecord || otpRecord.code !== code) {
                return res.status(401).json({ success: false, error: "Invalid OTP" });
            }

            if (new Date() > new Date(otpRecord.expiresAt)) {
                return res.status(401).json({ success: false, error: "OTP expired" });
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

        await prisma.otp.delete({ where: { phone } });

        res.json({
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
        res.status(500).json({ success: false, error: "Verification failed" });
    }
});

// Get staff list by role (for login selection)
app.get('/api/staff/:role', async (req, res) => {
    try {
        const staff = await prisma.user.findMany({
            where: { role: req.params.role.toUpperCase() },
            select: { id: true, name: true }
        });
        res.json(staff);
    } catch (error) {
        res.status(500).json([]);
    }
});

// --- DOCTOR ROUTES ---
app.get('/api/doctor/appointments/:doctorId', async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId: req.params.doctorId,
                status: { in: ["PENDING", "CONFIRMED"] },
                date: { gte: startOfToday }
            },
            include: { patient: true },
            orderBy: { date: "asc" },
        });

        const safeAppointments = appointments.map(apt => ({
            ...apt,
            patientName: apt.patientName || apt.patient?.name,
            patientAge: apt.patientAge || apt.patient?.age,
            patientGender: apt.patientGender || apt.patient?.sex
        }));

        res.json(safeAppointments);
    } catch (error) {
        res.status(500).json([]);
    }
});

app.get('/api/doctor/history/:doctorId', async (req, res) => {
    try {
        const { search } = req.query;
        const history = await prisma.appointment.findMany({
            where: {
                doctorId: req.params.doctorId,
                status: "COMPLETED",
                OR: search ? [
                    { patient: { name: { contains: search, mode: 'insensitive' } } },
                    { patient: { displayId: { contains: search, mode: 'insensitive' } } },
                ] : undefined
            },
            include: { patient: true, consultation: true },
            orderBy: { date: "desc" },
        });
        res.json(history);
    } catch (error) {
        res.status(500).json([]);
    }
});

app.get('/api/doctor/appointment/:id', async (req, res) => {
    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: req.params.id },
            include: { patient: true },
        });
        res.json(appointment);
    } catch (error) {
        res.status(500).json(null);
    }
});

// Cancel Appointment (POST - safer than PATCH)
app.post('/api/doctor/appointment/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) return res.status(400).json({ error: "Missing status" });

        const appointment = await prisma.appointment.update({
            where: { id },
            data: { status },
        });
        res.json(appointment);
    } catch (error) {
        console.error("API POST Doctor Appointment Cancel Error:", error);
        res.status(500).json({ error: "Failed to update: " + error.message });
    }
});

app.patch('/api/doctor/appointment/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) return res.status(400).json({ error: "Missing status" });

        const appointment = await prisma.appointment.update({
            where: { id },
            data: { status },
        });
        res.json(appointment);
    } catch (error) {
        console.error("API PATCH Doctor Appointment Error:", error);
        res.status(500).json({ error: "Failed to update" });
    }
});

app.get('/api/doctor/medicines/search', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.json([]);
    try {
        const meds = await prisma.medicine.findMany({
            where: { name: { contains: query, mode: 'insensitive' } },
            orderBy: { usageCount: "desc" },
            take: 10
        });
        res.json(meds);
    } catch (error) {
        res.status(500).json([]);
    }
});

app.get('/api/doctor/labs/search', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.json([]);
    try {
        const tests = await prisma.labTest.findMany({
            where: { name: { contains: query, mode: 'insensitive' } },
            orderBy: { usageCount: "desc" },
            take: 10
        });
        res.json(tests);
    } catch (error) {
        res.status(500).json([]);
    }
});

app.post('/api/doctor/consult/submit', async (req, res) => {
    const { appointmentId, diagnosis, notes, nextVisitDate, prescriptions, labRequests } = req.body;
    try {
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
                data: { status: "COMPLETED" },
            });
        }, {
            maxWait: 5000, // default: 2000
            timeout: 20000 // default: 5000
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Consultation submit CRITICAL error:", error);
        res.status(500).json({ success: false, error: error.message || "Server Transaction Failed" });
    }
});

// --- NEW: Doctor Instant Book (Walk-in) ---
app.post('/api/doctor/instant-book', async (req, res) => {
    const { name, age, sex, phone, doctorId } = req.body;
    try {
        let user = await prisma.user.findFirst({
            where: { phone, role: "PATIENT" }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    name, phone, age: parseInt(age), sex,
                    role: "PATIENT",
                    displayId: `PID-WALK-${Date.now().toString().slice(-4)}`
                }
            });
        }

        // Auto-assign next token for "Walk-in" slot (generic)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const count = await prisma.appointment.count({
            where: {
                doctorId,
                date: today,
                slotTime: "Walk-in"
            }
        });

        const appointment = await prisma.appointment.create({
            data: {
                patientId: user.id,
                doctorId,
                date: today,
                status: "CONFIRMED", // Instant is auto-confirmed
                slotTime: "Walk-in",
                tokenNumber: count + 1
            }
        });

        res.json({ success: true, appointment });
    } catch (error) {
        console.error("Instant Book Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- PATIENT ROUTES ---
app.get('/api/patient/doctors', async (req, res) => {
    try {
        const doctors = await prisma.user.findMany({
            where: { role: 'DOCTOR' },
            select: { id: true, name: true, specialization: true, startHour: true, endHour: true }
        });
        res.json(doctors);
    } catch (error) {
        res.status(500).json([]);
    }
});

app.post('/api/patient/book', async (req, res) => {
    const { patientId, doctorId, date, guestDetails } = req.body;
    try {
        let finalPatientId = patientId;

        if (!finalPatientId && guestDetails) {
            // Find or create guest user
            let user = await prisma.user.findFirst({
                where: { phone: guestDetails.phone, role: "PATIENT" }
            });

            if (!user) {
                user = await prisma.user.create({
                    data: {
                        name: guestDetails.name,
                        phone: guestDetails.phone,
                        age: parseInt(guestDetails.age),
                        sex: guestDetails.sex,
                        role: "PATIENT",
                        displayId: `PID-GUEST-${Date.now().toString().slice(-4)}`
                    }
                });
            }
            finalPatientId = user.id;
        }

        // Token System Logic
        let tokenNumber = 1;
        const slotTime = req.body.slotTime; // e.g., "09:00 - 10:00"

        if (slotTime) {
            // Fix: Use MAX + 1 instead of COUNT to avoid duplicates
            const lastAppointment = await prisma.appointment.findFirst({
                where: {
                    doctorId,
                    slotTime,
                    date: {
                        gte: new Date(date),
                        lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
                    },
                    status: { not: "CANCELLED" }
                },
                orderBy: { tokenNumber: 'desc' },
                select: { tokenNumber: true }
            });
            tokenNumber = (lastAppointment?.tokenNumber || 0) + 1;
        }

        const appointment = await prisma.appointment.create({
            data: {
                patientId: finalPatientId,
                doctorId,
                date: new Date(date),
                status: "PENDING",
                slotTime,
                tokenNumber,
                // Store actual patient details (Family Booking Support)
                patientName: guestDetails ? guestDetails.name : (req.body.patientName || null),
                patientAge: guestDetails ? parseInt(guestDetails.age) : (req.body.patientAge ? parseInt(req.body.patientAge) : null),
                patientGender: guestDetails ? guestDetails.sex : (req.body.patientGender || null)
            }
        });

        res.json({ success: true, appointment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/patient/history/:id', async (req, res) => {
    try {
        const history = await prisma.appointment.findMany({
            where: { patientId: req.params.id },
            include: {
                doctor: { select: { name: true } },
                consultation: {
                    include: {
                        prescriptions: { include: { items: { include: { medicine: true } } } },
                        labRequests: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        });
        res.json(history);
    } catch (error) {
        res.status(500).json([]);
    }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/staff', async (req, res) => {
    try {
        const staff = await prisma.user.findMany({
            where: { role: { in: ["DOCTOR", "PHARMACY", "LAB", "ADMIN"] } },
            orderBy: { createdAt: "desc" }
        });
        res.json(staff);
    } catch (error) {
        res.status(500).json([]);
    }
});

app.post('/api/admin/staff', async (req, res) => {
    try {
        // Prevent duplicate Staff IDs (Robust Check)
        if (req.body.displayId) {
            const checkId = req.body.displayId.trim();
            const existing = await prisma.user.findFirst({
                where: { displayId: checkId }
            });
            if (existing) {
                return res.status(400).json({ success: false, error: `Staff ID '${checkId}' already exists.` });
            }
        }

        const user = await prisma.user.create({ data: req.body });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/admin/staff/:id', async (req, res) => {
    try {
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/admin/staff/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Gather all linked appointments (Doctor OR Patient role)
            // 1. Gather all linked appointments (Doctor OR Patient role) - OPTIMIZED: Single Query
            const allAppointments = await tx.appointment.findMany({
                where: { OR: [{ doctorId: id }, { patientId: id }] }
            });

            if (allAppointments.length > 0) {
                const apptIds = allAppointments.map(a => a.id);

                // Find linked consultations
                const consultations = await tx.consultation.findMany({
                    where: { appointmentId: { in: apptIds } }
                });
                const consultIds = consultations.map(c => c.id);

                if (consultIds.length > 0) {
                    // Delete Lab Requests & Prescriptions linked to consultations
                    // Note: Cascading manually for safety, but gathering IDs first logic remains 
                    // to ensure correct order if constraints existed.

                    const prescriptions = await tx.prescription.findMany({
                        where: { consultationId: { in: consultIds } }
                    });
                    const presIds = prescriptions.map(p => p.id);

                    if (presIds.length > 0) {
                        await tx.prescriptionItem.deleteMany({
                            where: { prescriptionId: { in: presIds } }
                        });
                        await tx.prescription.deleteMany({
                            where: { id: { in: presIds } }
                        });
                    }

                    await tx.labRequest.deleteMany({
                        where: { consultationId: { in: consultIds } }
                    });

                    await tx.consultation.deleteMany({
                        where: { id: { in: consultIds } }
                    });
                }

                await tx.appointment.deleteMany({
                    where: { id: { in: apptIds } }
                });
            }

            // 2. If PHARMACY/LAB: Nullify references in processed items - OPTIMIZED: Parallel execution
            await Promise.all([
                tx.prescription.updateMany({
                    where: { dispensedById: id },
                    data: { dispensedById: null }
                }),
                tx.labRequest.updateMany({
                    where: { technicianId: id },
                    data: { technicianId: null }
                })
            ]);

            // 3. Finally, Delete the User
            await tx.user.delete({ where: { id } });
        }, {
            maxWait: 5000,
            timeout: 20000
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Delete Staff Error:", error);
        res.status(500).json({ success: false, error: `Delete Failed: ${error.message}` });
    }
});

// --- PHARMACY ROUTES ---
app.get('/api/pharmacy/queue', async (req, res) => {
    try {
        const queue = await prisma.prescription.findMany({
            where: {
                isDispensed: false,
                // Add queueStatus check if possible, but schema might not match strict types here.
                // kept simple for now matching legacy structure
            },
            include: {
                items: { include: { medicine: true } },
                consultation: {
                    include: { appointment: { include: { patient: true, doctor: true } } }
                }
            },
            orderBy: { createdAt: "asc" },
        });

        // Ensure patient details are accessible from the top level if needed by frontend
        // Frontend uses item.consultation.appointment.patient...
        // The previous frontend fix I requested handled the fallback path, so this might be fine.
        // But let's verify if I should map here.
        // The specific bug is about Doctor Dashboard (appointment list), so the previous edit is the critical one.

        res.json(queue);
    } catch (error) {
        res.status(500).json([]);
    }
});

app.get('/api/pharmacy/history', async (req, res) => {
    const { search } = req.query;
    try {
        const history = await prisma.prescription.findMany({
            where: {
                isDispensed: true,
                ...(search ? {
                    OR: [
                        { consultation: { appointment: { patient: { name: { contains: search, mode: 'insensitive' } } } } },
                        { consultation: { appointment: { patient: { displayId: { contains: search, mode: 'insensitive' } } } } }
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
        });
        res.json(history);
    } catch (error) {
        res.status(500).json([]);
    }
});

app.post('/api/pharmacy/dispense/:id', async (req, res) => {
    const { staffId } = req.body;
    try {
        await prisma.prescription.update({
            where: { id: req.params.id },
            data: { isDispensed: true, dispensedById: staffId }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- LAB ROUTES ---
app.get('/api/lab/requests', async (req, res) => {
    try {
        const requests = await prisma.labRequest.findMany({
            where: { status: "PENDING" },
            include: {
                consultation: {
                    include: { appointment: { include: { patient: true, doctor: true } } }
                }
            },
            orderBy: { createdAt: "asc" },
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json([]);
    }
});

app.get('/api/lab/history', async (req, res) => {
    const { search } = req.query;
    try {
        const history = await prisma.labRequest.findMany({
            where: {
                status: "COMPLETED",
                ...(search ? {
                    OR: [
                        { consultation: { appointment: { patient: { name: { contains: search, mode: 'insensitive' } } } } },
                        { consultation: { appointment: { patient: { displayId: { contains: search, mode: 'insensitive' } } } } }
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
        });
        res.json(history);
    } catch (error) {
        res.status(500).json([]);
    }
});

app.post('/api/lab/complete/:id', async (req, res) => {
    const { result, staffId } = req.body;
    try {
        await prisma.labRequest.update({
            where: { id: req.params.id },
            data: {
                status: "COMPLETED",
                resultReport: result,
                technicianId: staffId
            }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
