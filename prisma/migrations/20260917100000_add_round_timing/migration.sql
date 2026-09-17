-- AlterTable
ALTER TABLE "Round" ADD COLUMN "timeLimitSeconds" INTEGER NOT NULL DEFAULT 3600;
ALTER TABLE "Round" ADD COLUMN "startedAt" TIMESTAMP(3);
ALTER TABLE "Round" ADD COLUMN "stoppedAt" TIMESTAMP(3);

UPDATE "Round"
SET "startedAt" = "createdAt"
WHERE "status" = 'active' AND "startedAt" IS NULL;

UPDATE "Round"
SET "stoppedAt" = "updatedAt"
WHERE "status" = 'closed' AND "stoppedAt" IS NULL;

-- AlterTable
ALTER TABLE "Score" ADD COLUMN "elapsedMs" INTEGER;

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" SERIAL NOT NULL,
    "roundId" INTEGER NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobKey" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL,
    "elapsedMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebhookEvent_roundId_idx" ON "WebhookEvent"("roundId");

-- CreateIndex
CREATE INDEX "WebhookEvent_companyId_idx" ON "WebhookEvent"("companyId");

-- CreateIndex
CREATE INDEX "WebhookEvent_jobKey_idx" ON "WebhookEvent"("jobKey");

-- AddForeignKey
ALTER TABLE "WebhookEvent" ADD CONSTRAINT "WebhookEvent_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;
