/*
  Warnings:

  - You are about to drop the column `channel` on the `Campaign` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "channel";

-- AlterTable
ALTER TABLE "RolePermission" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "SentMessage" ADD COLUMN     "campaignDispatchId" INTEGER;

-- AlterTable
ALTER TABLE "UserRole" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "CampaignDispatch" (
    "id" SERIAL NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "totalSent" INTEGER NOT NULL DEFAULT 0,
    "totalDelivered" INTEGER NOT NULL DEFAULT 0,
    "totalFailed" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignDispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelProvider" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ChannelProvider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CampaignDispatch_campaignId_sentAt_idx" ON "CampaignDispatch"("campaignId", "sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_name_key" ON "Channel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelProvider_channelId_providerId_key" ON "ChannelProvider"("channelId", "providerId");

-- AddForeignKey
ALTER TABLE "CampaignDispatch" ADD CONSTRAINT "CampaignDispatch_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelProvider" ADD CONSTRAINT "ChannelProvider_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelProvider" ADD CONSTRAINT "ChannelProvider_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentMessage" ADD CONSTRAINT "SentMessage_campaignDispatchId_fkey" FOREIGN KEY ("campaignDispatchId") REFERENCES "CampaignDispatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
