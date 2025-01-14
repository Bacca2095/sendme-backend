/*
  Warnings:

  - You are about to drop the column `paymentDate` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `gatewayTransactionId` on the `Recharge` table. All the data in the column will be lost.
  - You are about to drop the column `messagesAdded` on the `Recharge` table. All the data in the column will be lost.
  - You are about to drop the column `messagesUsed` on the `Recharge` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `Recharge` table. All the data in the column will be lost.
  - The `status` column on the `Recharge` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `campaignUsage` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `contactUsage` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `messagesLimit` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paymentId]` on the table `Recharge` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paymentProviderId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `messageCount` to the `Recharge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remainingMessages` to the `Recharge` table without a default value. This is not possible if the table is not empty.
  - Made the column `organizationId` on table `Recharge` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "Recharge" DROP CONSTRAINT "Recharge_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Recharge" DROP CONSTRAINT "Recharge_subscriptionId_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "paymentDate",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentProviderId" INTEGER NOT NULL,
ADD COLUMN     "transactionId" TEXT,
ALTER COLUMN "status" SET DEFAULT 'pending',
ALTER COLUMN "subscriptionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "campaignLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "contactLimit" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Recharge" DROP COLUMN "gatewayTransactionId",
DROP COLUMN "messagesAdded",
DROP COLUMN "messagesUsed",
DROP COLUMN "subscriptionId",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "messageCount" INTEGER NOT NULL,
ADD COLUMN     "paymentId" INTEGER,
ADD COLUMN     "remainingMessages" INTEGER NOT NULL,
ALTER COLUMN "remainingAmount" DROP DEFAULT,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ALTER COLUMN "organizationId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "campaignUsage",
DROP COLUMN "contactUsage",
DROP COLUMN "messagesLimit",
DROP COLUMN "status";

-- CreateTable
CREATE TABLE "PaymentProvider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PaymentProvider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentProvider_name_key" ON "PaymentProvider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Recharge_paymentId_key" ON "Recharge"("paymentId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentProviderId_fkey" FOREIGN KEY ("paymentProviderId") REFERENCES "PaymentProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recharge" ADD CONSTRAINT "Recharge_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recharge" ADD CONSTRAINT "Recharge_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
