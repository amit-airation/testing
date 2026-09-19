export const JOB_WEBHOOKS_QUEUE = 'job-webhooks';

export type JobWebhookQueuePayload = {
  dto: {
    id: string;
    jobName: string;
    companyId: string;
    status: 'create' | 'publish';
    createdAt: string;
  };
  rawPayload: unknown;
  receivedAt: string;
};
