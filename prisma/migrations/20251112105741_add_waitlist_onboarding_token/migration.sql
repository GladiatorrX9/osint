/*
  Warnings:

  - A unique constraint covering the columns `[onboardingToken]` on the table `Waitlist` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Waitlist" ADD COLUMN "onboardingToken" TEXT;
ALTER TABLE "Waitlist" ADD COLUMN "tokenExpiresAt" DATETIME;

-- CreateIndex
CREATE UNIQUE INDEX "Waitlist_onboardingToken_key" ON "Waitlist"("onboardingToken");
