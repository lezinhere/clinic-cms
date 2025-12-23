
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLatestAppointment() {
    try {
        const appointment = await prisma.appointment.findFirst({
            orderBy: { createdAt: 'desc' },
            include: { patient: true }
        });

        console.log("Latest Appointment Check:");
        if (!appointment) {
            console.log("No appointments found.");
            return;
        }

        console.log("ID:", appointment.id);
        console.log("Patient ID:", appointment.patientId);
        console.log("Linked User Name:", appointment.patient.name);
        console.log("--- SPECIAL FIELDS ---");
        console.log("Stored Patient Name:", appointment.patientName);
        console.log("Stored Patient Age:", appointment.patientAge);
        console.log("Stored Patient Sex:", appointment.patientGender);
        console.log("Appointment Date:", appointment.date);
        console.log("Slot Time:", appointment.slotTime);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLatestAppointment();
