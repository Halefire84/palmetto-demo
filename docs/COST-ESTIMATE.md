# Operating Cost Estimate
# Palmetto Home Services — CRTC AI Automation Demo → Production
# 2026-11-16

---

## Demo environment (current build)

| Component | Cost | Notes |
|---|---|---|
| GitHub Pages hosting | $0 | Free public repo |
| AI model calls | $0 | No live API calls — classification is rule-based |
| SMS/messaging | $0 | No external messages sent |
| Database | $0 | localStorage only |
| Total demo cost | **$0/month** | |

---

## Minimum production estimate (1 customer, OpenPhone + Anthropic API)

| Component | Monthly cost | Notes |
|---|---|---|
| Cloudflare Pages hosting | $0–$20 | Included in existing CF account; Workers/KV may add ~$5–$20 |
| OpenPhone (call forwarding + SMS) | $15–$25/seat | Required for Call Rescue; customer pays this directly |
| Anthropic API — Claude Haiku 4.5 | ~$2–$8 | ~200 AI classification + response calls/month at ~$0.01–$0.04/call |
| Anthropic API — Claude Sonnet (escalations) | ~$5–$15 | ~50 complex responses/month |
| Supabase (database, free tier) | $0–$25 | Free up to 500MB; $25/mo for 8GB |
| Email delivery (Cloudflare Email Routing) | $0 | Already in use |
| CRTC AI labor — monthly support | Included in $197 care fee | |
| **Total CRTC AI-borne cost** | **~$7–$68/month** | Wide range because customer call volume drives API cost |

**At $197/month care fee:** margin is $129–$190/month per customer. Positive at almost all realistic volumes.

**Ceiling risk:** A high-volume customer (500+ calls/month) could push API costs to $30–$80/month, still below the $197 rate.

---

## At scale (10 customers)

| Component | Monthly cost (10 customers) |
|---|---|
| Hosting (CF Workers KV + Supabase Pro) | ~$50 |
| Anthropic API (avg $15/customer) | ~$150 |
| OpenPhone (customer-paid, not CRTC cost) | $0 to CRTC |
| Support labor (10 × 30 min/month) | Owner time only |
| **Total infrastructure cost** | **~$200/month** |
| **Revenue (10 × $197)** | **$1,970/month** |
| **Gross margin** | **~$1,770/month (~90%)** |

---

## AI call cost breakdown (Anthropic API, Nov 2026 pricing)

| Use case | Model | Est. tokens/call | Cost/call | Calls/month | Monthly |
|---|---|---|---|---|---|
| Inquiry classification | Haiku 4.5 | ~400 in / ~200 out | ~$0.008 | 150 | ~$1.20 |
| Auto-response draft | Haiku 4.5 | ~600 in / ~300 out | ~$0.012 | 100 | ~$1.20 |
| Complex escalation | Sonnet 4.6 | ~800 in / ~500 out | ~$0.045 | 30 | ~$1.35 |
| **Total API / customer** | | | | | **~$3.75/month** |

Estimates only. Actual cost depends on prompt length and volume.

---

## Cost assumptions

- Customer pays OpenPhone (~$15–$25/month) directly — not passed through CRTC
- Anthropic API key is CRTC's own (never the customer's)
- No SMS bulk fees at current volumes — OpenPhone subscription includes SMS
- Supabase free tier handles up to ~5 customers; Pro tier needed beyond that

---

## Production cost verdict

**Economically viable at current pricing.** The largest variable cost is Anthropic API usage, which scales with call volume but stays well below the care fee at any realistic small-business volume. The main financial risk is an unusually high-volume customer; this can be addressed with a usage fair-use limit in the service agreement.
