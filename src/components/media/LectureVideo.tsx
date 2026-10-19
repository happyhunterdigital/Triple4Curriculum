import React, { useState } from 'react';
import { Play, VideoOff } from 'lucide-react';
import { parseVideoSource } from '../../lib/video';

interface LectureVideoProps {
  src?: string | null;
  title?: string;
  /** Optional per-learner watermark rendered over the media (piracy deterrent). */
  watermark?: string;
  className?: string;
}

/**
 * Real lecture player.
 *
 * - YouTube (unlisted): click-to-load privacy-enhanced embed. Adaptive
 *   bitrate, global CDN and no storage cost while the school's own video
 *   pipeline is being built.
 * - Direct file/HLS URL: native <video> element.
 * - No source: a clear "not published yet" state instead of a fake player.
 */
export const LectureVideo: React.FC<LectureVideoProps> = ({ src, title, watermark, className }) => {
  const source = parseVideoSource(src);
  const [activated, setActivated] = useState(false);

  if (source.kind === 'none') {
    return (
      <div className={`aspect-video w-full bg-neutral-950 flex flex-col items-center justify-center gap-3 p-8 text-center ${className ?? ''}`}>
        <VideoOff className="w-10 h-10 text-neutral-600" />
        <p className="text-sm font-bold text-neutral-300">No lecture video published yet</p>
        <p className="text-xs text-neutral-500 max-w-sm">
          Your lecturer has not attached a recording to this module. Reading notes and the checkpoint quiz are still available.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative aspect-video w-full bg-neutral-950 overflow-hidden ${className ?? ''}`}>
      {watermark && (
        <div className="pointer-events-none absolute top-3 right-3 z-20 select-none rounded border border-yellow-400/30 bg-neutral-900/80 px-2 py-1 font-mono text-[10px] text-yellow-300 opacity-50">
          {watermark}
        </div>
      )}

      {source.kind === 'youtube' ? (
        activated ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={source.embedUrl}
            title={title ? `${title} — lecture video` : 'Lecture video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setActivated(true)}
            className="group absolute inset-0 flex items-center justify-center"
            aria-label="Play lecture video"
          >
            <img
              src={source.thumbnailUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-70 transition group-hover:opacity-80"
              loading="lazy"
              decoding="async"
            />
            <span className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 text-neutral-950 shadow-2xl transition group-hover:scale-110 group-hover:bg-yellow-300">
              <Play className="ml-1 h-8 w-8 fill-neutral-950" />
            </span>
            <span className="absolute bottom-3 left-3 z-10 rounded bg-neutral-950/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-300">
              YouTube · privacy-enhanced
            </span>
          </button>
        )
      ) : (
        <video
          className="absolute inset-0 h-full w-full"
          controls
          playsInline
          preload="metadata"
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
        >
          <source src={source.url} />
          Your browser does not support embedded video.
        </video>
      )}
    </div>
  );
};
