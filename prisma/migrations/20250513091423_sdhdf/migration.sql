/*
  Warnings:

  - You are about to drop the column `description` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "description",
ADD COLUMN     "externalUrl" TEXT,
ADD COLUMN     "googleMapsCode" TEXT;

-- AlterTable
ALTER TABLE "relationships" ADD COLUMN     "isCustomType" BOOLEAN NOT NULL DEFAULT false;
