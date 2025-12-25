const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const doctorId = "658000000000000000000003";
    console.log(`Checking for Doctor ID: ${doctorId}`);

    try {
        const doctor = await prisma.user.findUnique({
            where: { id: doctorId },
        });

        if (doctor) {
            console.log("✅ Doctor FOUND:");
            console.log(JSON.stringify(doctor, null, 2));
        } else {
            console.log("❌ Doctor NOT FOUND");
        }
    } catch (error) {
        console.error("Error querying database:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
