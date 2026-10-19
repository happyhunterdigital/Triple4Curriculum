import type { TimetableSlot } from '../types';

export type LiveProvider = 'google-meet' | 'jitsi' | 'external';

export interface LiveLink {
  url: string;
  /** True when the stored onlineLink was missing/fake and a Jitsi fallback was built. */
  isFallback: boolean;
  /** Human-readable note shown next to the join action. */
  embedNote: string;
  /** Which video provider the link targets. */
  provider: LiveProvider;
  /** Google Meet refuses to render in an iframe, so it opens externally. */
  canEmbed: boolean;
}

const FAKE_HOST = 'meet.triple4c.com';

function sanitizeRoomPart(part: string): string {
  return (part || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 48);
}

/** Classify a stored live-class URL. */
export function providerForUrl(raw: string): LiveProvider {
  try {
    const host = new URL(raw).hostname.replace(/^www\./, '');
    if (host === 'meet.google.com') return 'google-meet';
    if (host === 'meet.jit.si' || host.endsWith('.jitsi.si')) return 'jitsi';
    return 'external';
  } catch {
    return 'external';
  }
}

/**
 * Resolve the join link for a timetable slot.
 * - Returns the stored onlineLink when it is a real URL (not the
 *   meet.triple4c.com placeholder), preferring Google Meet when staff set it.
 * - Otherwise builds a deterministic Jitsi room:
 *   https://meet.jit.si/triple4c-{courseCode}-{day}-{start}
 */
export function getLiveLink(slot: Pick<TimetableSlot, 'courseCode' | 'dayOfWeek' | 'startTime' | 'onlineLink'>): LiveLink {
  const stored = (slot.onlineLink || '').trim();
  if (stored && !stored.includes(FAKE_HOST)) {
    const provider = providerForUrl(stored);
    return {
      url: stored,
      isFallback: false,
      embedNote:
        provider === 'google-meet'
          ? 'Opens in Google Meet in a new tab. Attendance is recorded when you join from here.'
          : '',
      provider,
      canEmbed: provider === 'jitsi',
    };
  }
  const code = sanitizeRoomPart(slot.courseCode || 'course') || 'course';
  const day = sanitizeRoomPart(slot.dayOfWeek || '') || 'live';
  const start = sanitizeRoomPart(slot.startTime || '') || 'class';
  const url = `https://meet.jit.si/triple4c-${code}-${day}-${start}`;
  return {
    url,
    isFallback: true,
    embedNote:
      'No staff link was set for this slot, so a temporary Jitsi room was generated. Staff can replace it with a Google Meet link.',
    provider: 'jitsi',
    canEmbed: true,
  };
}
