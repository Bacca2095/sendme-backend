/*
  Warnings:

  - The values [pending,processing,expired] on the enum `MessageStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MessageStatus_new" AS ENUM ('queued', 'sending', 'sent', 'delivered', 'undelivered', 'failed', 'received', 'scheduled', 'canceled', 'read');
ALTER TABLE "SentMessage" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "SentMessage" ALTER COLUMN "status" TYPE "MessageStatus_new" USING ("status"::text::"MessageStatus_new");
ALTER TYPE "MessageStatus" RENAME TO "MessageStatus_old";
ALTER TYPE "MessageStatus_new" RENAME TO "MessageStatus";
DROP TYPE "MessageStatus_old";
ALTER TABLE "SentMessage" ALTER COLUMN "status" SET DEFAULT 'queued';
COMMIT;

-- AlterTable
ALTER TABLE "SentMessage" ALTER COLUMN "status" SET DEFAULT 'queued';

-- DropEnum
DROP TYPE "MessageStatusEnum";
