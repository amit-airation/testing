# Round Scoring API

Admin APIs for rounds, participants, leaderboards, and event listing.

Job webhook ingest (`POST /webhooks/jobs`): [WEBHOOK.md](./WEBHOOK.md)

Base URL: `https://test.amitverma01.dev` (local: `http://localhost:3000`)

Interactive OpenAPI UI: [https://test.amitverma01.dev/docs](https://test.amitverma01.dev/docs)

Machine-readable specs:

- JSON: [https://test.amitverma01.dev/docs-json](https://test.amitverma01.dev/docs-json)
- YAML: [https://test.amitverma01.dev/docs-yaml](https://test.amitverma01.dev/docs-yaml)

Dates are ISO-8601 UTC strings. Durations are milliseconds unless the field name says `Seconds`.

---

## Auth

| Area | Header | Env var |
| --- | --- | --- |
| Admin (`/admin/*`) | `x-api-key: <key>` **or** `Authorization: Bearer <key>` | `ADMIN_API_KEY` |
| Webhooks | see [WEBHOOK.md](./WEBHOOK.md) | `WEBHOOK_SECRET` |

Missing or invalid credentials return `401`.

```http
GET /admin/rounds HTTP/1.1
x-api-key: $ADMIN_API_KEY
```

---

## Counts and round rules

Each job webhook increments that participant's **create** or **publish** count. There is no points system.

- Counts come from webhook events in the active round. Create then publish is **1 create and 1 publish**.
- Job ingest is documented in [WEBHOOK.md](./WEBHOOK.md).
- Only **one** round can be `active`. Starting a round closes any other active round (`status: closed`, `stoppedAt` set).
- Leaderboard order: `publishCount` desc, then `createCount` desc, then `lastElapsedMs` asc (faster wins). Missing elapsed time sorts last.

Round statuses: `draft` → `active` → `closed`.

---

## Shared response shapes

### `RoundTiming`

Returned by create / start / stop / update.

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
  "expired": false
}
```

| Field | Type | Notes |
| --- | --- | --- |
| `elapsedMs` | `number \| null` | `null` if the round has never started |
| `remainingMs` | `number \| null` | `null` if never started; `0` when expired |
| `expired` | `boolean` | `elapsedMs >= timeLimitSeconds * 1000` |

### `Participant`

```json
{
  "id": 3,
  "name": "Ada Lovelace",
  "companyName": "Analytical Engines",
  "mobileNumber": "9876543210",
  "companyId": "co_42",
  "roundId": 1,
  "createdAt": "2026-09-17T09:55:00.000Z",
  "updatedAt": "2026-09-17T09:55:00.000Z"
}
```

### `ParticipantSummary`

Used in round details, leaderboard, and participant details.

```json
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
```

`lastElapsedMs` is the **max** `elapsedMs` among that participant's scores.

### `WebhookEvent`

```json
{
  "id": 91,
  "roundId": 1,
  "companyId": "co_42",
  "jobKey": "job_abc123",
  "status": "publish",
  "elapsedMs": 32100,
  "createdAt": "2026-09-17T10:04:12.000Z"
}
```

### `RoundDetails`

Returned by `GET /admin/rounds/:roundId`, `GET /admin/rounds/:roundId/details`, and `GET /admin/rounds/active`.

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
  "participants": ["/* ParticipantSummary[] */"],
  "leaderboard": [
    {
      "rank": 1,
      "id": 3,
      "name": "Ada Lovelace",
      "createCount": 2,
      "publishCount": 1,
      "lastElapsedMs": 32100
    }
  ],
  "events": ["/* WebhookEvent[] newest first */"],
  "webhookEvents": ["/* same records as events */"],
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

Leaderboard entries are `ParticipantSummary` plus `rank`.

### Error

NestJS default error body:

```json
{
  "statusCode": 404,
  "message": "Round 1 not found",
  "error": "Not Found"
}
```

Validation failures use `message: string[]`.

| Status | When |
| ---: | --- |
| 400 | Invalid body, missing required fields, non-numeric path id |
| 401 | Missing/invalid API key |
| 404 | Round, participant, or active round not found |
| 409 | Round already started/not running; duplicate participant; add to closed round |

---

## Endpoints

### `GET /`

Health check. No auth.

```bash
curl http://localhost:3000/
```

**Response:** `Hello World!` (`text/plain` / string)

---

### `POST /admin/rounds`

Create a round.

**Query**

```ts
prisma.round.create({
  data: { name, timeLimitSeconds, status, startedAt }
})
```

If `status` is `active`, other active rounds are closed in the same transaction:

```ts
prisma.round.updateMany({
  where: { status: 'active' },
  data: { status: 'closed', stoppedAt: now }
})
```

**Body**

| Field | Required | Type | Notes |
| --- | --- | --- | --- |
| `name` | yes | string | |
| `timeLimitSeconds` | one of | int ≥ 1 | Preferred duration field |
| `time_limit_seconds` | alias | int ≥ 1 | |
| `timeLimitMinutes` | one of | int ≥ 1 | Stored as `minutes * 60` |
| `time_limit_minutes` | alias | int ≥ 1 | |
| `status` | no | `draft \| active \| closed` | Default `draft` |

```bash
curl -X POST http://localhost:3000/admin/rounds \
  -H "x-api-key: $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Campus Hackathon","timeLimitMinutes":15}'
```

**201** `RoundTiming`

---

### `GET /admin/rounds`

List rounds, newest first.

**Query**

```ts
prisma.round.findMany({
  orderBy: { createdAt: 'desc' },
  include: { _count: { select: { participants: true } } }
})
```

```bash
curl http://localhost:3000/admin/rounds \
  -H "x-api-key: $ADMIN_API_KEY"
```

**200** `RoundTiming[]` plus `_count.participants`

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

---

### `GET /admin/rounds/active`

Active round with full details. `404` if none.

**Query**

```ts
prisma.round.findFirst({
  where: { status: 'active' },
  orderBy: { startedAt: 'desc' }
})
```

then the same load as round details.

```bash
curl http://localhost:3000/admin/rounds/active \
  -H "x-api-key: $ADMIN_API_KEY"
```

**200** `RoundDetails`

---

### `GET /admin/rounds/:roundId`

### `GET /admin/rounds/:roundId/details`

Same payload. Participants in join order, events newest first.

**Query**

```ts
prisma.round.findUnique({
  where: { id: roundId },
  include: {
    participants: {
      orderBy: { createdAt: 'asc' },
      include: {
        scores: { include: { job: true }, orderBy: { createdAt: 'asc' } }
      }
    },
    webhookEvents: { orderBy: { createdAt: 'desc' } },
    _count: { select: { participants: true, webhookEvents: true } }
  }
})
```

```bash
curl http://localhost:3000/admin/rounds/1/details \
  -H "x-api-key: $ADMIN_API_KEY"
```

**200** `RoundDetails`  
**404** `{ "statusCode": 404, "message": "Round 1 not found", "error": "Not Found" }`

---

### `GET /admin/rounds/:roundId/leaderboard`

**Query:** same as round details; response is a subset.

```bash
curl http://localhost:3000/admin/rounds/1/leaderboard \
  -H "x-api-key: $ADMIN_API_KEY"
```

**200**

```json
{
  "roundId": 1,
  "name": "Campus Hackathon",
  "status": "active",
  "elapsedMs": 45000,
  "remainingMs": 855000,
  "expired": false,
  "summary": {
    "participantCount": 12,
    "eventCount": 34,
    "createCount": 22,
    "publishCount": 12
  },
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
  ]
}
```

---

### `GET /admin/rounds/:roundId/participants`

Newest participants first.

**Query**

```ts
prisma.participant.findMany({
  where: { roundId },
  orderBy: { createdAt: 'desc' }
})
```

```bash
curl http://localhost:3000/admin/rounds/1/participants \
  -H "x-api-key: $ADMIN_API_KEY"
```

**200** `Participant[]`

---

### `GET /admin/rounds/:roundId/participants/:participantId`

**Query**

```ts
prisma.participant.findFirst({
  where: { id: participantId, roundId },
  include: {
    round: true,
    scores: { include: { job: true }, orderBy: { createdAt: 'asc' } }
  }
})
```

```bash
curl http://localhost:3000/admin/rounds/1/participants/3 \
  -H "x-api-key: $ADMIN_API_KEY"
```

**200** `ParticipantSummary` plus `round: RoundTiming`

```json
{
  "round": {
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
    "expired": false
  },
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
```

**404** `Participant 3 not found in round 1`

---

### `PATCH /admin/rounds/:roundId`

Partial update. `status: "active"` starts; `status: "closed"` stops.

**Query**

```ts
prisma.round.update({
  where: { id: roundId },
  data: { name?, timeLimitSeconds? }
})
```

```bash
curl -X PATCH http://localhost:3000/admin/rounds/1 \
  -H "x-api-key: $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Campus Hackathon Finals","timeLimitMinutes":20}'
```

**200** `RoundTiming` (start/stop responses if `status` was sent)

---

### `POST /admin/rounds/:roundId/start`

**Query**

```ts
prisma.$transaction([
  prisma.round.updateMany({
    where: { status: 'active', id: { not: roundId } },
    data: { status: 'closed', stoppedAt: now }
  }),
  prisma.round.update({
    where: { id: roundId },
    data: { status: 'active', startedAt: now, stoppedAt: null }
  })
])
```

```bash
curl -X POST http://localhost:3000/admin/rounds/1/start \
  -H "x-api-key: $ADMIN_API_KEY"
```

**200** `RoundTiming` with `status: "active"`  
**409** `Round 1 is already started`

---

### `POST /admin/rounds/:roundId/stop`

**Query**

```ts
prisma.round.update({
  where: { id: roundId },
  data: { status: 'closed', stoppedAt: now }
})
```

```bash
curl -X POST http://localhost:3000/admin/rounds/1/stop \
  -H "x-api-key: $ADMIN_API_KEY"
```

**200** `RoundTiming` with `status: "closed"`  
**409** `Round 1 is not running`

---

### `POST /admin/rounds/:roundId/participants`

Cannot add to a **closed** round. Unique per round on `mobileNumber` and `companyId`.

**Query**

```ts
prisma.participant.create({
  data: { name, companyName, mobileNumber, companyId, roundId }
})
```

**Body** — send one name for each logical field:

| Logical field | Accepted keys |
| --- | --- |
| name | `name`, `userName`, `user_name` |
| companyName | `companyName`, `company_name` |
| mobileNumber | `mobileNumber`, `mobile_number`, `mobile` |
| companyId | `companyId`, `company_id` (coerced to string) |

```bash
curl -X POST http://localhost:3000/admin/rounds/1/participants \
  -H "x-api-key: $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ada Lovelace",
    "companyName": "Analytical Engines",
    "mobileNumber": "9876543210",
    "companyId": "co_42"
  }'
```

**201** `Participant`  
**400** `Missing required participant fields: name, companyName, ...`  
**409** `Cannot add participants to a closed round`  
**409** `Participant already exists in this round (roundId, companyId)`

---

### `GET /admin/rounds/:roundId/events`

**Query**

```ts
prisma.webhookEvent.findMany({
  where: { roundId },
  orderBy: { createdAt: 'desc' }
})
```

```bash
curl http://localhost:3000/admin/rounds/1/events \
  -H "x-api-key: $ADMIN_API_KEY"
```

**200** `WebhookEvent[]`

Job ingest lives in [WEBHOOK.md](./WEBHOOK.md).

---

## Typical flow

```bash
# 1. Create a 15-minute draft round
curl -X POST http://localhost:3000/admin/rounds \
  -H "x-api-key: $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Campus Hackathon","timeLimitMinutes":15}'

# 2. Register a participant
curl -X POST http://localhost:3000/admin/rounds/1/participants \
  -H "x-api-key: $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace","companyName":"Analytical Engines","mobileNumber":"9876543210","companyId":"co_42"}'

# 3. Start the clock
curl -X POST http://localhost:3000/admin/rounds/1/start \
  -H "x-api-key: $ADMIN_API_KEY"

# 4–5. Score jobs via the webhook — see WEBHOOK.md

# 6. Standings
curl http://localhost:3000/admin/rounds/1/leaderboard \
  -H "x-api-key: $ADMIN_API_KEY"

# 7. Stop
curl -X POST http://localhost:3000/admin/rounds/1/stop \
  -H "x-api-key: $ADMIN_API_KEY"
```
