/*
  Warnings:

  - You are about to drop the `memorials` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('MEMORIAL', 'BIOGRAPHY', 'AUTOBIOGRAPHY');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO');

-- DropForeignKey
ALTER TABLE "memorials" DROP CONSTRAINT "memorials_userId_fkey";

-- DropTable
DROP TABLE "memorials";

-- CreateTable
CREATE TABLE "legacy_pages" (
    "id" TEXT NOT NULL,
    "pageType" "PageType" NOT NULL,
    "slug" TEXT NOT NULL,
    "honoureeName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "dateOfPassing" TIMESTAMP(3),
    "creatorName" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "storyName" TEXT NOT NULL DEFAULT 'Story',
    "story" TEXT NOT NULL,
    "coverPhoto" TEXT,
    "honoureePhoto" TEXT,
    "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legacy_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "general_knowledge" (
    "id" TEXT NOT NULL,
    "personality" TEXT,
    "values" TEXT,
    "beliefs" TEXT,
    "legacyPageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "general_knowledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_items" (
    "id" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "dateTaken" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "legacyPageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "rsvpBy" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "description" TEXT,
    "message" TEXT,
    "legacyPageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relationships" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legacyPageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insights" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "legacyPageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memorial_details" (
    "id" TEXT NOT NULL,
    "funeralWishes" TEXT,
    "obituary" TEXT,
    "funeralHome" TEXT,
    "viewingDetails" TEXT,
    "processionDetails" TEXT,
    "serviceDetails" TEXT,
    "wakeDetails" TEXT,
    "finalRestingPlace" TEXT,
    "eulogy" TEXT,
    "orderOfService" TEXT,
    "familyMessage" TEXT,
    "memorialVideo" TEXT,
    "tributes" TEXT,
    "messageFromHonouree" TEXT,
    "legacyPageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memorial_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "legacy_pages_slug_key" ON "legacy_pages"("slug");

-- CreateIndex
CREATE INDEX "legacy_pages_userId_idx" ON "legacy_pages"("userId");

-- CreateIndex
CREATE INDEX "legacy_pages_slug_idx" ON "legacy_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "general_knowledge_legacyPageId_key" ON "general_knowledge"("legacyPageId");

-- CreateIndex
CREATE INDEX "media_items_legacyPageId_idx" ON "media_items"("legacyPageId");

-- CreateIndex
CREATE INDEX "events_legacyPageId_idx" ON "events"("legacyPageId");

-- CreateIndex
CREATE INDEX "relationships_legacyPageId_idx" ON "relationships"("legacyPageId");

-- CreateIndex
CREATE INDEX "insights_legacyPageId_idx" ON "insights"("legacyPageId");

-- CreateIndex
CREATE UNIQUE INDEX "memorial_details_legacyPageId_key" ON "memorial_details"("legacyPageId");

-- AddForeignKey
ALTER TABLE "legacy_pages" ADD CONSTRAINT "legacy_pages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "general_knowledge" ADD CONSTRAINT "general_knowledge_legacyPageId_fkey" FOREIGN KEY ("legacyPageId") REFERENCES "legacy_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_items" ADD CONSTRAINT "media_items_legacyPageId_fkey" FOREIGN KEY ("legacyPageId") REFERENCES "legacy_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_legacyPageId_fkey" FOREIGN KEY ("legacyPageId") REFERENCES "legacy_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_legacyPageId_fkey" FOREIGN KEY ("legacyPageId") REFERENCES "legacy_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_legacyPageId_fkey" FOREIGN KEY ("legacyPageId") REFERENCES "legacy_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memorial_details" ADD CONSTRAINT "memorial_details_legacyPageId_fkey" FOREIGN KEY ("legacyPageId") REFERENCES "legacy_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
