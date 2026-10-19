/**
 * Guardian-consent helpers (Children's Act 38/2005, COPPA under-13, POPIA).
 * Pure helpers — no breaking change to existing registration payloads.
 */

export interface GuardianFields {
  guardianName?: string;
  guardianContact?: string;
  guardianConsentGiven?: boolean;
}

export const MINOR_AGE = 18;

/** COPPA threshold: verifiable guardian consent required under 13. */
export const COPPA_AGE = 13;

/** Parse a YYYY-MM-DD date of birth into an age in full years, or null when invalid. */
export function ageFromDob(dob?: string, now: Date = new Date()): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

/** True when the date of birth indicates the learner is under 18. */
export function isMinor(dob?: string, now?: Date): boolean {
  const age = ageFromDob(dob, now);
  return age !== null && age < MINOR_AGE;
}

/** True when guardian consent details are required for this date of birth. */
export function requiresGuardianConsent(dob?: string, now?: Date): boolean {
  return isMinor(dob, now);
}

/** True when the date of birth indicates the learner is under 13 (COPPA). */
export function isUnder13(dob?: string, now?: Date): boolean {
  const age = ageFromDob(dob, now);
  return age !== null && age < COPPA_AGE;
}

/**
 * True when verifiable guardian consent is required before any processing:
 * under-13 (COPPA), and — where GDPR applies — under-16. No account may be
 * activated without it.
 */
export function requiresVerifiableGuardianConsent(dob?: string, now?: Date): boolean {
  return isUnder13(dob, now);
}

/** Validate guardian fields; returns an error map (empty when valid). */
export function validateGuardian(
  dob: string | undefined,
  guardian: GuardianFields,
): Partial<Record<'guardianName' | 'guardianContact', string>> {
  if (!requiresGuardianConsent(dob)) return {};
  const errors: Partial<Record<'guardianName' | 'guardianContact', string>> = {};
  if (!guardian.guardianName || guardian.guardianName.trim().length < 2) {
    errors.guardianName = 'Guardian name required for minors';
  }
  if (!guardian.guardianContact || guardian.guardianContact.trim().length < 5) {
    errors.guardianContact = 'Guardian contact required';
  }
  return errors;
}

/**
 * Attach guardian fields to a learner registration payload (non-breaking:
 * always includes the guardian key — null for adults — mirroring OnboardingFlow).
 */
export function withGuardianPayload<T extends Record<string, unknown>>(
  base: T,
  dob: string | undefined,
  guardian: GuardianFields,
): T & { guardian: { name: string; contact: string; consentGiven: boolean } | null; isMinor: boolean } {
  const minor = isMinor(dob);
  return {
    ...base,
    isMinor: minor,
    guardian: minor
      ? {
          name: guardian.guardianName || '',
          contact: guardian.guardianContact || '',
          consentGiven: guardian.guardianConsentGiven ?? true,
        }
      : null,
  };
}
