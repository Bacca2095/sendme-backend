-- CreateEnum
CREATE TYPE "MessageStatusEnum" AS ENUM ('queued', 'sending', 'sent', 'delivered', 'undelivered', 'failed', 'received', 'scheduled', 'canceled', 'read');

-- DropForeignKey
ALTER TABLE "SentMessage" DROP CONSTRAINT "SentMessage_providerId_fkey";

-- AlterTable
ALTER TABLE "SentMessage" ALTER COLUMN "providerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SentMessage" ADD CONSTRAINT "SentMessage_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
