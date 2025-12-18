import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Cleanup existing
  // await prisma.user.deleteMany() // Optional: clear DB on seed

  // 1. Doctor
  const doctor = await prisma.user.upsert({
    where: { id: 'user-doctor-1' },
    update: {},
    create: {
      id: 'user-doctor-1',
      name: 'Dr. John Doe',
      role: 'DOCTOR',
    },
  })

  // 2. Patient
  const patient = await prisma.user.upsert({
    where: { id: 'user-patient-1' },
    update: {},
    create: {
      id: 'user-patient-1',
      name: 'Alice Smith',
      role: 'PATIENT',
      age: 29,
      sex: 'Female',
      phone: '1234567890',
    },
  })

  // 3. Pharmacy
  const pharmacy = await prisma.user.upsert({
    where: { id: 'user-pharmacy-1' },
    update: {},
    create: {
      id: 'user-pharmacy-1',
      name: 'Central Pharamcy',
      role: 'PHARMACY',
    },
  })

  // 4. Lab
  const lab = await prisma.user.upsert({
    where: { id: 'user-lab-1' },
    update: {},
    create: {
      id: 'user-lab-1',
      name: 'City Diagnostics',
      role: 'LAB',
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

  console.log({ doctor, patient, pharmacy, lab })
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
