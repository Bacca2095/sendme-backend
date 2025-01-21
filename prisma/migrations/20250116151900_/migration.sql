/*
  Warnings:

  - You are about to drop the column `authMethod` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `dataMapping` on the `Provider` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Provider" DROP COLUMN "authMethod",
DROP COLUMN "dataMapping";
