/*
  Warnings:

  - You are about to drop the column `channel` on the `SentMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "apiKey" TEXT;

-- AlterTable
ALTER TABLE "SentMessage" DROP COLUMN "channel";

-- DropEnum
DROP TYPE "MessageChannel";
