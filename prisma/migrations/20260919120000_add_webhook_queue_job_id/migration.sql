-- AlterTable
ALTER TABLE "WebhookEvent" ADD COLUMN "queueJobId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_queueJobId_key" ON "WebhookEvent"("queueJobId");
