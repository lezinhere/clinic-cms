
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function backfill() {
    const users = await prisma.user.findMany({
        where: { role: "PATIENT", displayId: null }
    });

    console.log(`Found ${users.length} patients to backfill.`);

    for (const user of users) {
        const pid = `PID-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
        await prisma.user.update({
            where: { id: user.id },
            data: { displayId: pid }
        });
        console.log(`Updated ${user.name} with ID ${pid}`);
    }

    console.log("Backfill complete.");
}

backfill()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
