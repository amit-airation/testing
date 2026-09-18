# Round APIs

Base URL: `https://test.amitverma01.dev` (local: `http://localhost:3000`)

Auth: `x-api-key: $ADMIN_API_KEY` or `Authorization: Bearer $ADMIN_API_KEY`

Missing or invalid credentials return `401`.

Round statuses: `draft` → `active` → `closed`. Only one round can be `active`. Starting a round closes any other active round.

Dates are ISO-8601 UTC. Durations are milliseconds unless the field name says `Seconds`.

---

## `GET /admin/rounds`

List rounds, newest first.

```bash
curl http://localhost:3000/admin/rounds \
  -H "x-api-key: $ADMIN_API_KEY"
```

**200**

```json
[
  {
    "id": 1,
    "name": "Campus Hackathon",
    "status": "draft",
    "timeLimitSeconds": 900,
    "startedAt": null,
    "stoppedAt": null,
    "createdAt": "2026-09-17T09:50:00.000Z",
    "updatedAt": "2026-09-17T09:50:00.000Z",
    "elapsedMs": null,
    "remainingMs": null,
    "expired": false,
    "_count": { "participants": 0 }
  }
]
```

| Field | Type | Notes |
| --- | --- | --- |
| `elapsedMs` | `number \| null` | `null` if the round has never started |
| `remainingMs` | `number \| null` | `null` if never started; `0` when expired |
| `expired` | `boolean` | `elapsedMs >= timeLimitSeconds * 1000` |
| `_count.participants` | `number` | Participants in the round |

---

## Round details

Same payload for all three:

- `GET /admin/rounds/:roundId`
- `GET /admin/rounds/:roundId/details`
- `GET /admin/rounds/active` (`404` if none)

Participants are in join order. Events are newest first. Leaderboard is `publishCount` desc, then `createCount` desc, then fastest `lastElapsedMs`.

```bash
curl http://localhost:3000/admin/rounds/1/details \
  -H "x-api-key: $ADMIN_API_KEY"
```

```bash
curl http://localhost:3000/admin/rounds/active \
  -H "x-api-key: $ADMIN_API_KEY"
```

**200**

```json
{
  "id": 1,
  "name": "Campus Hackathon",
  "status": "active",
  "timeLimitSeconds": 900,
  "startedAt": "2026-09-17T10:00:00.000Z",
  "stoppedAt": null,
  "createdAt": "2026-09-17T09:50:00.000Z",
  "updatedAt": "2026-09-17T10:00:00.000Z",
  "elapsedMs": 45000,
  "remainingMs": 855000,
  "expired": false,
  "participants": [
    {
      "id": 3,
      "name": "Ada Lovelace",
      "companyName": "Analytical Engines",
      "mobileNumber": "9876543210",
      "companyId": "co_42",
      "createdAt": "2026-09-17T09:55:00.000Z",
      "createCount": 2,
      "publishCount": 1,
      "lastElapsedMs": 32100,
      "jobCount": 2,
      "scores": [
        {
          "id": 8,
          "elapsedMs": 32100,
          "jobId": "job_abc123",
          "jobName": "Backend Engineer",
          "status": "publish",
          "publishedAt": "2026-09-17T10:04:12.000Z",
          "createdAt": "2026-09-17T10:03:01.000Z"
        }
      ]
    }
  ],
  "leaderboard": [
    {
      "rank": 1,
      "id": 3,
      "name": "Ada Lovelace",
      "companyName": "Analytical Engines",
      "mobileNumber": "9876543210",
      "companyId": "co_42",
      "createdAt": "2026-09-17T09:55:00.000Z",
      "createCount": 2,
      "publishCount": 1,
      "lastElapsedMs": 32100,
      "jobCount": 2,
      "scores": []
    }
  ],
  "events": [
    {
      "id": 91,
      "roundId": 1,
      "companyId": "co_42",
      "jobKey": "job_abc123",
      "status": "publish",
      "elapsedMs": 32100,
      "createdAt": "2026-09-17T10:04:12.000Z"
    }
  ],
  "webhookEvents": [],
  "summary": {
    "participantCount": 12,
    "eventCount": 34,
    "createCount": 22,
    "publishCount": 12
  },
  "_count": {
    "participants": 12,
    "webhookEvents": 34
  }
}
```

`webhookEvents` is the same records as `events`. `lastElapsedMs` is the max `elapsedMs` among that participant's jobs.

**404**

| Path | Message |
| --- | --- |
| `/admin/rounds/:roundId` | `Round 1 not found` |
| `/admin/rounds/active` | `No active round` |

---

## `POST /admin/rounds/:roundId/start`

Starts the round. Closes any other active round first (`status: closed`, `stoppedAt` set). No body.

```bash
curl -X POST http://localhost:3000/admin/rounds/1/start \
  -H "x-api-key: $ADMIN_API_KEY"
```

**200**

```json
{
  "id": 1,
  "name": "Campus Hackathon",
  "status": "active",
  "timeLimitSeconds": 900,
  "startedAt": "2026-09-17T10:00:00.000Z",
  "stoppedAt": null,
  "createdAt": "2026-09-17T09:50:00.000Z",
  "updatedAt": "2026-09-17T10:00:00.000Z",
  "elapsedMs": 0,
  "remainingMs": 900000,
  "expired": false
}
```

**404** `Round 1 not found`  
**409** `Round 1 is already started`

---

## `POST /admin/rounds/:roundId/stop`

Stops the running round. No body.

```bash
curl -X POST http://localhost:3000/admin/rounds/1/stop \
  -H "x-api-key: $ADMIN_API_KEY"
```

**200** same shape as start, with `status: "closed"` and `stoppedAt` set.

**404** `Round 1 not found`  
**409** `Round 1 is not running`

---

## Errors

```json
{
  "statusCode": 404,
  "message": "Round 1 not found",
  "error": "Not Found"
}
```

| Status | When |
| ---: | --- |
| 400 | Non-numeric `roundId` |
| 401 | Missing or invalid API key |
| 404 | Round not found, or no active round |
| 409 | Already started, or not running |
