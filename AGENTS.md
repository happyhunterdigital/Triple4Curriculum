# Agent instructions

## Consent-gated third-party scripts (mandatory)

No analytics, tracking pixel, advertising tag, session-replay tool, or other non-essential third-party script may load, initialise, make a request, or store an identifier until the visitor clicks **Accept** on the cookie banner. Declining, dismissing, or ignoring loads nothing optional. Accept must load immediately without a reload.

- Use the first-party consent helper (`hasConsent()` / `HHConsent`) or declare HTML scripts as `<script type="text/plain" data-consent="analytics" data-src="...">`.
- Never put a tracker in `index.html`, a Next.js root layout, or a module that runs on page load.
- Strictly necessary first-party code (routing, auth, cart, product Firebase) is exempt but must be documented in `CONSENT.md`.
- Run `node scripts/consent-audit.mjs` and keep `.github/workflows/consent-audit.yml` green before finishing any change that touches scripts, analytics, or the cookie banner.

Full policy: `CONSENT.md` in this repository and the `consent-gated-analytics` skill at the happyhunterdigital workspace root.
