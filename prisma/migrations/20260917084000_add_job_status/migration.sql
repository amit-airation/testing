-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('create', 'publish');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN "status" "JobStatus" NOT NULL DEFAULT 'create';
ALTER TABLE "Job" ADD COLUMN "publishedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Score_participantId_jobId_key" ON "Score"("participantId", "jobId");
