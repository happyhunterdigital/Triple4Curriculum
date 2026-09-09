# Privacy Notice (POPIA) - Demo Stub

**Updated:** 2026-09-09 · **Contact:** privacy@triple4c.com

This demo build processes only fictional seed data plus whatever you type
locally. Before production use with real learners you must:

1. Appoint an Information Officer and publish their details.
2. Complete a full POPIA assessment (lawful basis, retention, cross-border).
3. Capture consent at registration (`agreePrivacy`, already enforced in the
   demo API with `registerSchema`) and keep an auditable record.
4. Minimise data: the demo truncates + hashes network identifiers
   (`hashIp`) and restricts audit logs to admins.
5. Honour access (POPIA s14 export: `GET /api/v1/auth/export-my-data?userId=…`)
   and erasure (`DELETE /api/v1/auth/delete-my-account`) requests.
6. Wire persistence to Firestore/Postgres with server timestamps, soft-delete
   flags and `createdBy`/`updatedAt` audit fields.

No biometric, SA-SAMS or DRM processing exists in this build - related UI copy
is labelled **Demo / Roadmap**.
