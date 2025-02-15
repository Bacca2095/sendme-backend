-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'inactive', 'paused', 'cancelled');

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "status" "SubscriptionStatus" NOT NULL DEFAULT 'active';
