/**
 * Video source resolution for the learning portal.
 *
 * The platform is intentionally provider-agnostic. Today lectures are hosted
 * on YouTube (unlisted) and live classes use Google Meet or a Jitsi fallback;
 * the same interface accepts self-hosted MP4/HLS so the player does not need
 * to change when the school moves to its own video pipeline (Cloudflare
 * Stream, Mux, or a custom CDN).
 */

export type ParsedVideo =
  | {
      kind: 'youtube';
      id: string;
      watchUrl: string;
      embedUrl: string;
      thumbnailUrl: string;
    }
  | {
      kind: 'file';
      url: string;
    }
  | {
      kind: 'none';
    };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** Extract a YouTube video id from any common URL shape (watch, youtu.be, embed, shorts, live). */
export function extractYouTubeId(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  // Bare id (staff may paste just the id).
  if (YOUTUBE_ID.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '');
  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0] ?? '';
    return YOUTUBE_ID.test(id) ? id : null;
  }

  if (host !== 'youtube.com' && host !== 'youtube-nocookie.com' && host !== 'music.youtube.com') {
    return null;
  }

  const v = url.searchParams.get('v');
  if (v && YOUTUBE_ID.test(v)) return v;

  const parts = url.pathname.split('/').filter(Boolean);
  const marker = parts.findIndex((p) => ['embed', 'shorts', 'live', 'v'].includes(p));
  if (marker >= 0 && parts[marker + 1] && YOUTUBE_ID.test(parts[marker + 1])) {
    return parts[marker + 1];
  }

  return null;
}

/**
 * Resolve a stored lecture video URL into something the player can render.
 * YouTube is preferred for VOD because it gives adaptive bitrate, global CDN
 * delivery and zero hosting cost while the school builds its own pipeline.
 */
export function parseVideoSource(raw?: string | null): ParsedVideo {
  const value = (raw ?? '').trim();
  if (!value) return { kind: 'none' };

  const youtubeId = extractYouTubeId(value);
  if (youtubeId) {
    return {
      kind: 'youtube',
      id: youtubeId,
      watchUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      // Privacy-enhanced embed: no YouTube cookies until playback, no related
      // videos from other channels (rel=0).
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`,
      thumbnailUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    };
  }

  if (/^https?:\/\//i.test(value)) {
    return { kind: 'file', url: value };
  }

  return { kind: 'none' };
}

/** True when a lecture already has playable media. */
export function hasPlayableVideo(raw?: string | null): boolean {
  return parseVideoSource(raw).kind !== 'none';
}
