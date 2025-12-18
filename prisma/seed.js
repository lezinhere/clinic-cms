const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // 1. Doctor
    const doctors = [
        { id: '658000000000000000000002', name: 'Dr. John Doe', role: 'DOCTOR', specialization: 'Cardiologist', displayId: 'DOC-001', passcode: '1234' },
        { id: '658000000000000000000003', name: 'Dr. Abbas VM', role: 'DOCTOR', specialization: 'ENT', displayId: 'DOC-002', passcode: '1234' },
        { id: '658000000000000000000004', name: 'Dr. Nasrina', role: 'DOCTOR', specialization: 'Gynecologist', displayId: 'DOC-003', passcode: '1234' },
        { id: '658000000000000000000005', name: 'Dr. Sara', role: 'DOCTOR', specialization: 'Pediatrician', displayId: 'DOC-004', passcode: '1234' },
        { id: '658000000000000000000006', name: 'Dr. Saifudheen', role: 'DOCTOR', specialization: 'Physician', displayId: 'DOC-005', passcode: '1234' },
    ]

    for (const doc of doctors) {
        await prisma.user.upsert({
            where: { id: doc.id },
            update: { specialization: doc.specialization, displayId: doc.displayId, passcode: doc.passcode },
            create: {
                id: doc.id,
                name: doc.name,
                role: 'DOCTOR',
                specialization: doc.specialization,
                displayId: doc.displayId,
                passcode: doc.passcode
            },
        })
    }

    // 2. Patient
    const patient = await prisma.user.upsert({
        where: { id: '658000000000000000000001' },
        update: {},
        create: {
            id: '658000000000000000000001',
            name: 'Alice Smith',
            role: 'PATIENT',
            age: 29,
            sex: 'Female',
            phone: '1234567890',
            displayId: 'PID-BACKFILL-001'
        },
    })

    // 3. Pharmacy
    const pharmacy = await prisma.user.upsert({
        where: { id: '658000000000000000000007' },
        update: { passcode: '1234' },
        create: {
            id: '658000000000000000000007',
            name: 'Central Pharamcy',
            role: 'PHARMACY',
            displayId: 'PHARM-001',
            passcode: '1234'
        },
    })

    // 4. Lab
    const lab = await prisma.user.upsert({
        where: { id: '658000000000000000000008' },
        update: { passcode: '1234' },
        create: {
            id: '658000000000000000000008',
            name: 'City Diagnostics',
            role: 'LAB',
            displayId: 'LAB-001',
            passcode: '1234'
        },
    })

    // 5. Admin
    await prisma.user.upsert({
        where: { displayId: 'ADMIN-001' },
        update: { passcode: '8888' },
        create: {
            name: 'System Admin',
            role: 'ADMIN',
            displayId: 'ADMIN-001',
            passcode: '8888'
        },
    })

    // 5. Initial Medicine (to test autocomplete)
    await prisma.medicine.upsert({
        where: { name: 'Paracetamol' },
        update: {},
        create: {
            name: 'Paracetamol',
            usageCount: 5,
        },
    })

    // 6. Initial Lab Tests
    const initialTests = ["CBC", "Lipid Profile", "Thyroid Profile", "X-Ray Chest", "MRI Scan", "Urine Routine"]
    for (const test of initialTests) {
        await prisma.labTest.upsert({
            where: { name: test },
            update: {},
            create: { name: test, usageCount: 1 }
        })
    }

    console.log({ doctors, patient, pharmacy, lab })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
