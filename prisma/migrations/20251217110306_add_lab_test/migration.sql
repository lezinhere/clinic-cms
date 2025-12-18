-- CreateTable
CREATE TABLE "LabTest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "LabTest_name_key" ON "LabTest"("name");
