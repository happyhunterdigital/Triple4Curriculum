/**
 * Academic calendar.
 *
 * No live classes run before TERM_START_ISO. Everything learner-facing that
 * would otherwise imply a live lesson (the "live now" dot, "next class",
 * attendance prompts) keys off these helpers, so moving the date is a one-line
 * change when the Q1 calendar is confirmed.
 */
export const TERM_START_ISO = '2027-01-13';
export const TERM_LABEL = 'Term 1, 2027';

const start = new Date(`${TERM_START_ISO}T00:00:00+02:00`);

/** True once the first teaching day has begun (SAST). */
export function hasTermStarted(now: Date = new Date()): boolean {
  return now.getTime() >= start.getTime();
}

/** Whole days until teaching starts; 0 or negative once it has. */
export function daysUntilTerm(now: Date = new Date()): number {
  return Math.ceil((start.getTime() - now.getTime()) / 86_400_000);
}

export function termStartLabel(): string {
  return start.toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Johannesburg',
  });
}

export function termStartWeekday(): string {
  return start.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'Africa/Johannesburg' });
}
