/*
  Warnings:

  - Added the required column `updatedAt` to the `CampaignRule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CampaignRule" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "CustomValue" ADD COLUMN     "deletedAt" TIMESTAMP(3);
