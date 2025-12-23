const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const id = '694a3c7d18ff98eb01fb704f';
    console.log("Fetching appointment:", id);
    try {
        const appt = await prisma.appointment.findUnique({
            where: { id },
            include: { doctor: true, patient: true }
        });
        console.log("Appointment Data:");
        console.log(JSON.stringify(appt, null, 2));
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
