/*
  Warnings:

  - The `deliveryStatus` column on the `SentMessage` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "SentMessage" DROP COLUMN "deliveryStatus",
ADD COLUMN     "deliveryStatus" JSONB;

-- DropEnum
DROP TYPE "DeliveryStatus";
