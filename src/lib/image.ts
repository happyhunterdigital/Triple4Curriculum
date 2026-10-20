/**
 * Image delivery policy for T4C — every image must be served optimised.
 *
 * 1. Cloudinary images: always pass the URL through `cloudinaryImage(url, width)`.
 *    It inserts `f_auto,q_auto,w_<width>,c_limit` so the CDN negotiates AVIF/WebP
 *    and never sends a 1024px+ asset for a 64px slot. Pick the width to match the
 *    rendered size (x2 for crispness on small logos/avatars, x1 for full-bleed).
 * 2. Other hosts (Unsplash `auto=format&fit=crop&w=…&q=…`, YouTube thumbnails)
 *    already optimise at their CDN — the helper returns them untouched.
 * 3. Every <img> needs `loading="lazy"` + `decoding="async"` unless it is the
 *    above-the-fold hero, which uses `loading="eager"` + `fetchPriority="high"`.
 * 4. Never commit large binaries to the repo — host media on Cloudinary.
 *
 * Example:
 *   <img src={cloudinaryImage(HERO_URL, 1400)} loading="eager" decoding="async" ... />
 *   <img src={cloudinaryImage(LOGO_URL, 72)} loading="lazy" decoding="async" ... />
 */

const CLOUDINARY_IMAGE = '/image/upload/';

export function cloudinaryImage(url: string | null | undefined, width: number): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com/') || !url.includes(CLOUDINARY_IMAGE)) return url;

  const [base, rest] = url.split(CLOUDINARY_IMAGE);
  if (!base || !rest) return url;

  const first = rest.split('/')[0] ?? '';
  // Already transformed (e.g. f_auto,q_auto,w_128/…)? Leave it alone.
  const hasTransforms = first.length > 0 && !/^v\d+$/.test(first) && !first.includes('.');
  if (hasTransforms) return url;

  const w = Math.max(16, Math.round(width));
  return `${base}${CLOUDINARY_IMAGE}f_auto,q_auto,w_${w},c_limit/${rest}`;
}
