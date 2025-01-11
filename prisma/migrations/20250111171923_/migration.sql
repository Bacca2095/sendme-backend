/*
  Warnings:

  - You are about to drop the column `scheduledAt` on the `Campaign` table. All the data in the column will be lost.
  - Added the required column `description` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('active', 'inactive', 'blocked');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('active', 'inactive', 'paused', 'finished');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ConditionType" ADD VALUE 'is_empty';
ALTER TYPE "ConditionType" ADD VALUE 'not_empty';

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "scheduledAt",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "rrule" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "CampaignStatus" NOT NULL DEFAULT 'active',
ADD COLUMN     "time" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "status" "ContactStatus" NOT NULL DEFAULT 'active';
