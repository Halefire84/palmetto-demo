# Failure & Recovery Report
# Palmetto Home Services — CRTC AI Automation Demo
# Version: 1.0 — 2026-11-16

---

## Failure modes tested

| Test ID | Failure injected | Expected behavior | Result |
|---|---|---|---|
| SC-16 | Owner notification timeout | Error logged; lead still saved | Tested in demo runner |
| SC-17 | Error resolve + re-notify | Error marks resolved; lead intact | Tested in demo runner |
| SC-10 | Missing phone number | Workflow rejects before lead created | Tested in demo runner |
| SC-11 | Missing service type | Validation fail, clean rejection | Tested in demo runner |
| SC-12 | Description too short | Validation fail | Tested in demo runner |
| SC-09 | Duplicate submission | Second run suppressed; no double record | Tested in demo runner |
| SC-15 | Opted-out phone | Blocked before lead created | Tested in demo runner |
| SC-20 | Calendar slot conflict | Second booking rejected with error message | Tested in demo runner |

---

## Recovery behaviors

### Lead-first ordering
The workflow saves the lead record **before** attempting notifications. A failed push or email never causes lead data loss. This is the most important recovery guarantee.

### Error log
Every caught exception is written to `{ns}_errors` in localStorage (production: database). Fields: `at`, `ctx`, `msg`, `retryable`, `resolved`. Unresolved errors surface in the owner dashboard.

### Idempotency / dedup
Duplicate detection compares phone + description within a 5-minute window. A second identical submission within that window returns the original lead ID and skips all downstream actions. No duplicate notification is sent.

### Opt-out enforcement
Opt-out check runs after validation but before lead creation. An opted-out phone exits the workflow immediately with `{ok:false, optedOut:true}`. No lead is created, no message sent.

### Calendar conflict
`appointments.book()` checks for an existing non-cancelled appointment at the requested slot before confirming. Returns `{ok:false, error:…}` on conflict. Caller decides whether to offer an alternative slot.

---

## Known unhandled failures (open defects)

| Defect ID | Description | Severity | Status |
|---|---|---|---|
| DEF-001 | Retry after notification failure is not automatic — requires owner manual action | Medium | OPEN |
| DEF-002 | No persistent queue: if the browser/server restarts mid-workflow, the in-flight step is lost | High | OPEN (requires backend queue) |
| DEF-003 | No follow-up scheduler — SC-13 (unresponsive lead) stays in CONTACTED forever | Medium | OPEN |
| DEF-004 | No human escalation routing — SC-14 flags the lead but takes no automatic action | Medium | OPEN |
| DEF-005 | Calendar has no concept of business hours — any slot can be booked | Low | OPEN |

---

## Production readiness of recovery system

**Demo environment:** PASS on tested failure modes. Fail-safe lead storage confirmed.

**Production gap:** DEF-002 (no persistent queue) is a blocker for production deployment. Any mid-workflow server restart loses in-flight state. Resolution: replace the in-memory workflow runner with a durable queue (database-backed job table or Temporal).

**Verdict:** NOT READY for production. Recovery is functional for demo purposes. DEF-002 must be resolved before any customer deployment.
