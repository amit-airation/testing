# Job Webhook

Base URL: `https://test.amitverma01.dev` (local: `http://localhost:3000`)

`POST /webhooks/jobs`

Send a job `create` event when a job is created, and a `publish` event when it is published.

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

| Status | When |
| ---: | --- |
| 201 | Event accepted |
| 400 | Invalid body |
| 401 | Missing or invalid bearer token |
| 403 | No active round, or the round time limit has expired |
| 404 | `companyId` does not match a participant in the active round |
