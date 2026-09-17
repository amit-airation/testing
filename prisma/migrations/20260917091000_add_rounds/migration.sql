-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('draft', 'active', 'closed');

-- CreateTable
CREATE TABLE "Round" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" "RoundStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Round_status_idx" ON "Round"("status");

-- DropIndex
DROP INDEX "Participant_mobileNumber_key";

-- AlterTable
ALTER TABLE "Participant" ADD COLUMN "roundId" INTEGER;

INSERT INTO "Round" ("name", "status", "createdAt", "updatedAt")
SELECT 'Legacy Round', 'closed'::"RoundStatus", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Participant" WHERE "roundId" IS NULL);

UPDATE "Participant"
SET "roundId" = (SELECT "id" FROM "Round" ORDER BY "id" ASC LIMIT 1)
WHERE "roundId" IS NULL;

ALTER TABLE "Participant" ALTER COLUMN "roundId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Participant_roundId_idx" ON "Participant"("roundId");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_roundId_mobileNumber_key" ON "Participant"("roundId", "mobileNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_roundId_companyId_key" ON "Participant"("roundId", "companyId");

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;
