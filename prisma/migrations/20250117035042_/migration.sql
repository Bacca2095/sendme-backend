/*
  Warnings:

  - Added the required column `recipient` to the `SentMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SentMessage" ADD COLUMN     "recipient" TEXT NOT NULL;
