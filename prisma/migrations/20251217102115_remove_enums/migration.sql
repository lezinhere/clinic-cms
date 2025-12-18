-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "age" INTEGER,
    "sex" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointmentId" TEXT NOT NULL,
    "notes" TEXT,
    "diagnosis" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Consultation_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Medicine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "consultationId" TEXT NOT NULL,
    "isDispensed" BOOLEAN NOT NULL DEFAULT false,
    "dispensedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Prescription_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prescription_dispensedById_fkey" FOREIGN KEY ("dispensedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrescriptionItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prescriptionId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PrescriptionItem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "consultationId" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "resultReport" TEXT,
    "technicianId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LabRequest_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LabRequest_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Consultation_appointmentId_key" ON "Consultation"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Medicine_name_key" ON "Medicine"("name");
