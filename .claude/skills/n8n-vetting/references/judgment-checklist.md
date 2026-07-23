# Judgment checklist — what the linter cannot decide

The CLI rules on eleven deterministic things. These five need a human or LLM read of the
source. For each: what to look for, why it matters, the reference case.

## 1. Unsigned webhook → verify-by-refetch
Applies to trigger nodes consuming a provider webhook.
- **Look for:** does the node emit the incoming request body directly, or does it
  re-fetch the resource from the provider by id (using its own credential) before
  emitting, and drop on failure?
- **Why:** if the provider does not sign payloads, anyone who finds the webhook URL can
  POST fabricated events. Emitting an unverified body is a spoofing hole.
- **Reference:** the `n8n-nodes-opn` trigger, `Verify Event` default-on. It calls
  `GET /events/{id}` and only forwards what it just read back from the provider.

## 2. Credential leakage
- **Look for:** secrets from credentials reaching output items, `console`/logger calls,
  or error messages. Error branches are the usual culprit — they echo the failed request
  including its auth header.
- **Why:** a leaked key in an execution's output persists in n8n's execution data.
- **Fix pattern:** mask or omit auth material from anything returned or logged.

## 3. Request content-type tested against the live API
- **Look for:** a declarative node sending `application/json` to an API that expects
  `application/x-www-form-urlencoded` (Stripe/Omise-style). Was a real call made?
- **Why:** the node can declare correctly and still 4xx at runtime. A node that only ever
  passed shape tests, never a live call, hides this.

## 4. getAll returns items, not the envelope
- **Look for:** a `getAll`/list operation returning `{ object: 'list', data: [...] }` as
  a single item, missing `postReceive.rootProperty: 'data'`.
- **Why:** this is tell #1 that the node was never run on real data. Downstream nodes get
  one opaque envelope instead of per-item output.

## 5. Paid-feature overlap
- **Look for:** scope that competes with an n8n paid or enterprise feature.
- **Why:** n8n reserves the right to reject such nodes regardless of quality. A scope
  judgment, not a code one.

## The framing that wins
Every one of these, when it recurs, has one answer: catch the class at the source. The
deterministic CLI is that answer for the mechanical rules. For these five, name what a
submission-time CI gate or a scaffold default would add so the issue cannot ship again.
Fix the friction at the source rather than flagging it each time.
