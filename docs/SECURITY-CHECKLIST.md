# Security & Data Isolation Checklist
# Palmetto Home Services — CRTC AI Automation Demo
# 2026-11-16

---

## Demo environment (current build)

| Check | Requirement | Status | Notes |
|---|---|---|---|
| No real customer data | All names, phones, emails are fictional | ✓ PASS | test domain `.test`, not `.com` |
| No real phone numbers | All demo phones are 843-555-XXXX | ✓ PASS | Not real numbers |
| No external messages | No SMS, email, or calls sent | ✓ PASS | localStorage only, no external API |
| No production credentials | No API keys in source | ✓ PASS | No credentials in repo |
| Opt-out enforced | Opted-out phone blocks workflow before lead creation | ✓ PASS | Tested in SC-15 |
| Duplicate prevention | Same phone+description within 5min suppressed | ✓ PASS | Tested in SC-09 |
| Namespace isolation | Each tenant uses prefixed localStorage key | ✓ PASS | `palmetto_` prefix; second customer would use different prefix |
| Demo label visible | "DEMO ENVIRONMENT" shown on every page | ✓ PASS | Yellow bar on all pages |
| No credentials in git | Checked before commit | ✓ PASS | Static HTML + JS only |
| No hardcoded secrets | Config file has no API keys | ✓ PASS | palmetto.js has no secrets |

---

## Production requirements (not yet built)

| Check | Requirement | Status | Blocker |
|---|---|---|---|
| Authentication | Owner login with session management | ✗ NOT BUILT | Needs auth system |
| Role-based access | Owner vs staff vs read-only | ✗ NOT BUILT | Needs RBAC |
| Tenant isolation | Each business's data physically separated | ✗ NOT BUILT | Needs multi-tenant DB |
| Encrypted credentials | Any real API keys in encrypted vault | ✗ NOT BUILT | Needs secrets manager |
| HTTPS enforcement | All traffic encrypted in transit | — | Cloudflare handles for crtcai.com |
| Data at rest | Customer records encrypted in DB | ✗ NOT BUILT | Needs production DB |
| Prompt injection protection | External content treated as untrusted input | ✗ NOT BUILT | Needs input sanitization in AI calls |
| Agent permission boundary | AI cannot exceed defined tool permissions | ✗ NOT BUILT | Needs policy engine |
| Human escalation routing | Escalation flag actually reaches a human | ✗ PARTIAL | Flag set; routing not built |
| Audit log | Immutable record of every action | ✗ PARTIAL | Activity log in lead record; not immutable |
| Credential rotation | API keys can be rotated without downtime | ✗ NOT BUILT | Needs key management |
| Test/prod isolation | Demo data never touches production | ✓ DESIGN | Separate namespace; production not built yet |

---

## OWASP LLM top risks — status for this build

| Risk | Description | Status |
|---|---|---|
| Prompt injection | External content manipulates AI actions | NOT TESTED — no live AI calls in demo |
| Insecure output handling | AI output used without validation | PARTIAL — classification output is used but not externally displayed without escaping |
| Training data poisoning | N/A for this build | N/A |
| Model denial of service | N/A for demo | N/A |
| Supply chain | Third-party JS or model dependency | LOW RISK — no CDN dependencies, no external model in demo |
| Sensitive info disclosure | Customer data leaked in logs | LOW RISK in demo; must audit when live AI is added |
| Insecure plugin design | N/A — no plugins in current build | N/A |
| Excessive agency | AI agent takes unauthorized actions | NOT TESTED — no live agent actions in demo |
| Overreliance | Treating AI output as verified fact | ADDRESSED — classification is advisory, not authoritative |
| Model theft | Model extraction attacks | N/A |

---

## Production security verdict

**Demo environment:** Adequate for internal demonstration.

**Production deployment:** BLOCKED on authentication, tenant isolation, encrypted credential storage, and prompt injection testing. Do not deploy real customer data until these are resolved.
