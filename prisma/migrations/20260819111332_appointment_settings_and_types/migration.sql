-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "AppointmentSettings" (
    "id" TEXT NOT NULL DEFAULT 'appointments',
    "openHour" INTEGER NOT NULL DEFAULT 8,
    "closeHour" INTEGER NOT NULL DEFAULT 17,
    "daysOpen" "Weekday"[] DEFAULT ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']::"Weekday"[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppointmentSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultDurationMinutes" INTEGER NOT NULL DEFAULT 60,
    "color" TEXT NOT NULL DEFAULT 'blue',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppointmentType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppointmentType_active_idx" ON "AppointmentType"("active");

-- Seed a default type so existing appointments (which had free-text reasons, not mappable to real types) have somewhere to land
INSERT INTO "AppointmentType" ("id", "name", "defaultDurationMinutes", "color", "active", "createdAt", "updatedAt") VALUES
    ('apptype_general', 'General', 60, 'slate', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable: add nullable appointmentTypeId alongside the still-present reason column
ALTER TABLE "Appointment" ADD COLUMN "appointmentTypeId" TEXT;

-- Backfill every existing appointment to the default type
UPDATE "Appointment" SET "appointmentTypeId" = 'apptype_general';

-- Preserve the old free-text reason in notes before dropping the column
UPDATE "Appointment" SET "notes" = CASE
    WHEN "notes" IS NULL OR "notes" = '' THEN 'Reason: ' || "reason"
    ELSE 'Reason: ' || "reason" || E'\n' || "notes"
END;

-- AlterTable: drop the old reason column now that its data has been migrated
ALTER TABLE "Appointment" DROP COLUMN "reason";

-- CreateIndex
CREATE INDEX "Appointment_appointmentTypeId_idx" ON "Appointment"("appointmentTypeId");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_appointmentTypeId_fkey" FOREIGN KEY ("appointmentTypeId") REFERENCES "AppointmentType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
