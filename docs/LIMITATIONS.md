# Known Limitations & Open Defects
# Palmetto Home Services — CRTC AI Automation Demo
# 2026-11-16

---

## Production-blocking deficiencies

| ID | Area | Description | Priority |
|---|---|---|---|
| DEF-001 | Execution engine | No persistent queue — in-flight steps are lost on restart | P0 (blocker) |
| DEF-002 | Authentication | No login system — dashboard is open to anyone who has the URL | P0 (blocker) |
| DEF-003 | Tenant isolation | localStorage is scoped to browser, not to a user account | P0 (blocker) |
| DEF-004 | AI classification | Classification is rule-based (keywords + urgency field), not a live AI model call | P0 (before selling AI package) |
| DEF-005 | Real communications | No actual SMS, email, or call forwarding in demo | P0 (before live deployment) |

---

## Medium-priority gaps

| ID | Area | Description |
|---|---|---|
| DEF-006 | Follow-up scheduler | No time-based follow-up — SC-13 leads stay in CONTACTED indefinitely |
| DEF-007 | Human escalation routing | Escalation flag is set on the lead but no routing to a real inbox |
| DEF-008 | Business hours | Appointment slots can be booked outside operating hours |
| DEF-009 | Notification retry | Failed notifications require manual owner action; no automatic retry |
| DEF-010 | Quote management | Workflow C (quote management) is not implemented |
| DEF-011 | Mobile push | Owner notifications are dashboard-only; no push to phone |

---

## Simulation-only behaviors

These work in the demo but simulate what a production system would do:

| Behavior | Demo implementation | Production implementation needed |
|---|---|---|
| AI response generation | Static template by service type | Live Anthropic API call with business-specific prompt |
| Owner notification | Write to localStorage notifications array | Email + ntfy push (Cloudflare Worker already exists) |
| SMS send | Suppressed | OpenPhone webhook or Twilio |
| Appointment calendar | In-memory slot check | Real calendar integration (Google Calendar, Cal.com, etc.) |
| Data persistence | localStorage (clears with browser data) | Supabase PostgreSQL |
| Multi-tenant isolation | Namespace prefix in localStorage | Separate DB rows with RLS per organization |

---

## What is fully working

| Component | Status | Evidence |
|---|---|---|
| Lead intake form | ✓ WORKING | index.html form → engine.js processInquiry() |
| Input validation | ✓ WORKING | SC-10, SC-11, SC-12 pass |
| Duplicate prevention | ✓ WORKING | SC-09 passes |
| Opt-out enforcement | ✓ WORKING | SC-15 passes |
| AI classification (rule-based) | ✓ WORKING | Category, urgency, score, response generated |
| Owner notification (demo) | ✓ WORKING | Notification array populated, dashboard shows it |
| Error logging | ✓ WORKING | SC-16 passes |
| Error resolve | ✓ WORKING | SC-17 passes |
| Appointment booking | ✓ WORKING | SC-08 passes |
| Calendar conflict prevention | ✓ WORKING | SC-20 passes |
| Reusable engine | ✓ WORKING | engine.js accepts any config object |
| Multi-tenant namespace | ✓ WORKING | PALMETTO_CONFIG.namespace isolates keys |
| Dashboard auto-refresh | ✓ WORKING | Polls every 3 seconds |
| 20-scenario test runner | ✓ WORKING | demo/index.html runs all 20 with PASS/FAIL |
| Workflow trace | ✓ WORKING | Each step recorded with status and detail |

---

## Production readiness verdict

**Current status: NOT READY — DEMO ONLY**

The demo proves the workflow logic, data model, and test harness. It is suitable for showing prospects the concept.

**Required before CERTIFIED FOR CUSTOMER PILOT:**
- DEF-001: Persistent execution queue
- DEF-002: Authentication
- DEF-003: Real database with tenant isolation
- DEF-004: Live AI model calls replacing rule-based classifier
- DEF-005: Real SMS/email integration

Estimated production build: 4–8 weeks from current state, consistent part-time development.
