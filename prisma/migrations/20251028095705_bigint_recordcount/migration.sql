/*
  Warnings:

  - You are about to alter the column `recordCount` on the `LeakedDatabase` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LeakedDatabase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "leakDate" DATETIME NOT NULL,
    "recordCount" BIGINT NOT NULL,
    "dataTypes" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "affectedOrg" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_LeakedDatabase" ("affectedOrg", "createdAt", "dataTypes", "description", "id", "leakDate", "name", "recordCount", "severity", "source", "status", "updatedAt") SELECT "affectedOrg", "createdAt", "dataTypes", "description", "id", "leakDate", "name", "recordCount", "severity", "source", "status", "updatedAt" FROM "LeakedDatabase";
DROP TABLE "LeakedDatabase";
ALTER TABLE "new_LeakedDatabase" RENAME TO "LeakedDatabase";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
