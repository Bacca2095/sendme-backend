/*
  Warnings:

  - You are about to drop the column `deliveryInfo` on the `SentMessage` table. All the data in the column will be lost.
  - You are about to drop the column `providerResponse` on the `SentMessage` table. All the data in the column will be lost.
  - You are about to drop the column `recipient` on the `SentMessage` table. All the data in the column will be lost.
  - Added the required column `recipientDetails` to the `SentMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SentMessage" DROP COLUMN "deliveryInfo",
DROP COLUMN "providerResponse",
DROP COLUMN "recipient",
ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "deliveryDetails" JSONB,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "messageType" TEXT,
ADD COLUMN     "priority" INTEGER,
ADD COLUMN     "providerRawResponse" JSONB,
ADD COLUMN     "recipientDetails" TEXT NOT NULL;
