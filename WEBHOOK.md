# Job Webhook

Base URL: `https://test.amitverma01.dev` (local: `http://localhost:3000`)

`POST /webhooks/jobs`

Send a job `create` event when a job is created, and a `publish` event when it is published.

Events are accepted asynchronously: the HTTP handler authenticates and validates the body, enqueues the payload on Redis/BullMQ (`job-webhooks`), and returns **202**. A worker then matches `companyId` to the active round, records the event, upserts the job, and updates scores.

## Auth

```http
Authorization: Bearer $WEBHOOK_SECRET
```

## Body

| Field | Keys | Required | Notes |
| --- | --- | --- | --- |
| job id | `id`, `jobId`, `job_id` | yes | coerced to string |
| job name | `jobName`, `job_name` | yes | string |
| company id | `companyId`, `company_id` | yes | coerced to string |
| status | `status` | yes | `create` or `publish` (case-insensitive) |
| created at | `createdAt`, `created_at` | yes | ISO-8601 UTC timestamp from the source job |

```bash
curl -X POST https://test.amitverma01.dev/webhooks/jobs \
  -H "Authorization: Bearer $WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "job_abc123",
    "jobName": "Backend Engineer",
    "companyId": "co_42",
    "status": "create",
    "createdAt": "2026-09-17T10:03:01.000Z"
  }'
```

Snake_case aliases are accepted:

```json
{
  "job_id": "job_abc123",
  "job_name": "Backend Engineer",
  "company_id": "co_42",
  "status": "publish",
  "created_at": "2026-09-17T10:03:01.000Z"
}
```

## Responses

**202 Accepted**

```json
{
  "accepted": true,
  "jobId": "1",
  "queue": "job-webhooks",
  "receivedAt": "2026-09-17T10:04:12.000Z"
}
```

| Field | Notes |
| --- | --- |
| `jobId` | BullMQ job id (use for ops/debugging) |
| `queue` | Always `job-webhooks` |
| `receivedAt` | Timestamp used for `elapsedMs` when the worker runs |

| Status | When |
| ---: | --- |
| 202 | Event accepted and enqueued |
| 400 | Invalid body |
| 401 | Missing or invalid bearer token |

Participant-not-found and expired-round errors are handled in the worker (failed BullMQ jobs), not as HTTP `404` / `403`.
