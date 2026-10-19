import { describe, it, expect } from 'vitest';
import { extractYouTubeId, parseVideoSource } from '../src/lib/video';

describe('video source resolution', () => {
  it('extracts ids from every common YouTube URL shape', () => {
    const id = 'dQw4w9WgXcQ';
    expect(extractYouTubeId(`https://www.youtube.com/watch?v=${id}`)).toBe(id);
    expect(extractYouTubeId(`https://youtu.be/${id}?t=42`)).toBe(id);
    expect(extractYouTubeId(`https://www.youtube.com/shorts/${id}`)).toBe(id);
    expect(extractYouTubeId(`https://www.youtube.com/live/${id}`)).toBe(id);
    expect(extractYouTubeId(`https://www.youtube-nocookie.com/embed/${id}`)).toBe(id);
    expect(extractYouTubeId(`https://m.youtube.com/watch?v=${id}`)).toBe(id);
    expect(extractYouTubeId(id)).toBe(id);
  });

  it('rejects non-YouTube hosts and malformed ids', () => {
    expect(extractYouTubeId('https://example.com/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(extractYouTubeId('https://youtu.be/short')).toBeNull();
    expect(extractYouTubeId('')).toBeNull();
  });

  it('builds a privacy-enhanced embed for YouTube sources', () => {
    const source = parseVideoSource('https://youtu.be/dQw4w9WgXcQ');
    expect(source.kind).toBe('youtube');
    if (source.kind === 'youtube') {
      expect(source.embedUrl).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');
      expect(source.thumbnailUrl).toContain('i.ytimg.com');
    }
  });

  it('treats direct media URLs as file sources', () => {
    const source = parseVideoSource('https://cdn.example.com/lectures/intro.mp4');
    expect(source).toEqual({ kind: 'file', url: 'https://cdn.example.com/lectures/intro.mp4' });
  });

  it('returns none for empty or invalid input', () => {
    expect(parseVideoSource('').kind).toBe('none');
    expect(parseVideoSource(undefined).kind).toBe('none');
    expect(parseVideoSource('not-a-url').kind).toBe('none');
  });
});
