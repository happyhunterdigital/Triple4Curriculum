import React, { useEffect, useMemo, useState } from 'react';
import type { LearnerImage } from '../../data/learnersGallery';
import { cloudinaryImage, cloudinarySrcSet } from '../../lib/image';

/** Only Cloudinary-hosted gallery entries get CDN transforms; local paths pass through. */
function serveOptimised(src: string, width: number): { src: string; srcSet?: string } {
  if (!src.includes('res.cloudinary.com/')) return { src };
  return {
    src: cloudinaryImage(src, width),
    srcSet: cloudinarySrcSet(src, [480, 800, 1200]),
  };
}

/**
 * Waterfall / masonry gallery.
 *
 * Items keep their original aspect ratio (no cropping, no clipping): each photo
 * is measured by its width/height ratio and placed in whichever column is
 * currently shortest, so columns end up within a photo of each other.
 *
 * CSS multi-column was tried first but browsers will fragment an item taller
 * than the balanced column height even with break-inside:avoid, which clipped
 * the bottom of portrait photos. Distributing in JS avoids that entirely.
 */

function useColumnCount() {
  const read = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  };
  const [count, setCount] = useState(read);

  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setCount(read()));
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return count;
}

/** Shortest-column-first distribution, using the photo's aspect ratio as height. */
function distribute(images: LearnerImage[], columns: number): LearnerImage[][] {
  if (columns <= 1) return [images];

  const buckets: LearnerImage[][] = Array.from({ length: columns }, () => []);
  const heights = new Array(columns).fill(0);

  for (const image of images) {
    const ratio = image.width && image.height ? image.height / image.width : 1.25;
    let target = 0;
    for (let i = 1; i < columns; i += 1) {
      if (heights[i] < heights[target]) target = i;
    }
    buckets[target].push(image);
    // +0.12 approximates the caption strip under each photo.
    heights[target] += ratio + 0.12;
  }

  return buckets;
}

export const MasonryGallery: React.FC<{ images: LearnerImage[] }> = ({ images }) => {
  const columns = useColumnCount();
  const grouped = useMemo(() => distribute(images, columns), [images, columns]);

  return (
    <div className="mt-6 flex items-start gap-3 sm:gap-4" aria-label="Learner gallery">
      {grouped.map((column, columnIndex) => (
        <div key={columnIndex} className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4">
          {column.map((image) => {
            const isFirst = images.indexOf(image) === 0;
            const served = serveOptimised(image.src, 800);
            return (
              <figure
                key={image.src}
                className="overflow-hidden rounded-[16px] border border-black/10 bg-white"
              >
                <img
                  src={served.src}
                  srcSet={served.srcSet}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  loading={isFirst ? 'eager' : 'lazy'}
                  fetchPriority={isFirst ? 'high' : undefined}
                  decoding="async"
                  className="block h-auto w-full"
                />
                <figcaption className="p-3.5 text-xs leading-relaxed text-neutral-600">
                  {image.caption}
                </figcaption>
              </figure>
            );
          })}
        </div>
      ))}
    </div>
  );
};
