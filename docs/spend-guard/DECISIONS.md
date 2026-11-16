# Spend Guard Decision Log

## 2026-09-16 — Separate Wedge Funnel

Decision:
Build Spend Guard as a smaller CloudSight wedge while keeping it inside the existing CloudSight repository.

Reason:
Reach first customer value faster without abandoning the broader platform.

---

## 2026-09-16 — Organization-Scoped Architecture

Decision:
Use Organization ownership for budgets and cloud accounts instead of direct User ownership.

Reason:
CloudSight is B2B software. Multiple users need to share company-level AWS resources and cost configuration.

---

## 2026-09-16 — React Router for Internal Funnel Navigation

Decision:
Use React Router Link/navigation for internal funnel routes.

Reason:
Avoid full document reloads and white transition flashes.

---

## 2026-09-16 — Mock AWS During Development

Decision:
Keep the real STS verification path while allowing development mock verification.

Environment:

SPEND_GUARD_MOCK_AWS=true

Reason:
AWS account access is temporarily unavailable, but product development should continue.

---

## 2026-09-16 — Real STS Architecture

Decision:
Customer AWS access will use AssumeRole and temporary credentials.

Reason:
Do not require customers to provide long-lived AWS access keys.

---

## 2026-09-16 — First Value Before More UI

Decision:
Prioritize budget persistence and first analysis over additional landing-page polish.

Reason:
The product needs an end-to-end value loop before additional presentation work.
