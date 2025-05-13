-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "author" TEXT,
    "legacyPageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quotes_legacyPageId_idx" ON "quotes"("legacyPageId");

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_legacyPageId_fkey" FOREIGN KEY ("legacyPageId") REFERENCES "legacy_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
