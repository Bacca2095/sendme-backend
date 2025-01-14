/*
  Warnings:

  - Added the required column `frequency` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "days" "Weekday"[],
ADD COLUMN     "frequency" "Frequency" NOT NULL;
