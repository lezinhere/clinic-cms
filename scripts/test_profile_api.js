// scripts/test_profile_api.js
// Simulating an internal fetch since we can't easily curl the Next.js app from here without running it.
// We will use the prisma client directly to verify the DB side of that route logic first.
// Actually, better to test the route logic via a partial integration test if possible, but 
// for now let's just re-verify the DB data for that doctor ID specifically.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const doctorId = '658000000000000000000003'; //From previous debug
    console.log("Testing Doctor Fetch for ID:", doctorId);
    try {
        const doctor = await prisma.user.findUnique({
            where: { id: doctorId }
        });
        console.log("Doctor Found:", doctor);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
