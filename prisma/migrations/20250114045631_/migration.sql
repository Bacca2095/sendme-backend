/*
  Warnings:

  - Added the required column `pricePerMessage` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaignUsage` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RechargeStatus" AS ENUM ('pending', 'completed', 'failed');

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "pricePerMessage" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "campaignLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "campaignUsage" INTEGER NOT NULL,
ADD COLUMN     "contactLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "contactUsage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "messagesLimit" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Recharge" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "messagesAdded" INTEGER NOT NULL,
    "messagesUsed" INTEGER NOT NULL DEFAULT 0,
    "remainingAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "gatewayTransactionId" TEXT,
    "status" "RechargeStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionId" INTEGER NOT NULL,
    "organizationId" INTEGER,

    CONSTRAINT "Recharge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Recharge" ADD CONSTRAINT "Recharge_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recharge" ADD CONSTRAINT "Recharge_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
