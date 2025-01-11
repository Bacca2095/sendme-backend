/*
  Warnings:

  - Added the required column `channel` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentType` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('SMS', 'EMAIL', 'WHATSAPP', 'PUSH_NOTIFICATION', 'OTHER');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('pending', 'queued', 'processing', 'sent', 'failed', 'expired');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('pending', 'delivered', 'undelivered');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('plain_text', 'html');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "channel" "MessageChannel" NOT NULL,
ADD COLUMN     "contentType" "ContentType" NOT NULL;

-- CreateTable
CREATE TABLE "SentMessage" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "channel" "MessageChannel" NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'pending',
    "deliveryInfo" JSONB,
    "providerResponse" JSONB,
    "messageId" TEXT,
    "providerId" INTEGER NOT NULL,
    "campaignId" INTEGER,
    "contactId" INTEGER,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SentMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contact_email_phone_idx" ON "Contact"("email", "phone");

-- CreateIndex
CREATE INDEX "Organization_name_idx" ON "Organization"("name");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "SentMessage" ADD CONSTRAINT "SentMessage_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentMessage" ADD CONSTRAINT "SentMessage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentMessage" ADD CONSTRAINT "SentMessage_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentMessage" ADD CONSTRAINT "SentMessage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
