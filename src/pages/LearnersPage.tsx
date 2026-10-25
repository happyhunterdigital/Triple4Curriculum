import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageShell, SectionEyebrow, SectionHeading, Body, RevealStagger } from '../components/site/Section';
import { learnerFaqs, learnersGallery } from '../data/learnersGallery';
import { injectJsonLd, setCanonical, setMetaDescription } from '../lib/seo';

const SITE = 'https://triple4c.com';
const GALLERY_URL = `${SITE}/learners`;
const DESCRIPTION =
  'Inside the Triple 4 Curriculum learner gallery: practice at the piano, ' +
  'coursework on Chromebooks and reading in the library. See what the 4-4-4 week looks like.';

export function LearnersPage() {
  useEffect(() => {
    document.title = 'Learner Gallery: Triple 4 Curriculum';
    setMetaDescription(DESCRIPTION);
    setCanonical(GALLERY_URL);

    const gallerySchema = injectJsonLd('learners-gallery-schema', {
      '@context': 'https://schema.org',
      '@type': 'ImageGallery',
      name: 'Learners at Triple 4 Curriculum',
      description: DESCRIPTION,
      url: GALLERY_URL,
      about: {
        '@type': 'EducationalOrganization',
        name: 'Triple 4 Curriculum',
        url: SITE,
      },
      image: learnersGallery.map((img) => ({
        '@type': 'ImageObject',
        contentUrl: `${SITE}${img.src}`,
        name: img.alt,
        caption: img.caption,
        description: img.alt,
        width: img.width,
        height: img.height,
        creditText: 'Triple 4 Curriculum',
        copyrightNotice: 'Triple 4 Curriculum',
      })),
    });

    const faqSchema = injectJsonLd('learners-faq-schema', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: learnerFaqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    });

    return () => {
      gallerySchema.remove();
      faqSchema.remove();
    };
  }, []);

  return (
    <div className="w-full bg-[var(--color-canvas-soft)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="rounded-[16px] bg-white border border-black/10 p-6 sm:p-8 lg:p-10">
          <SectionEyebrow>Learner Gallery</SectionEyebrow>
          <h1 className="mt-2 font-display text-[30px] sm:text-[42px] font-semibold tracking-tight leading-[0.95] text-[var(--color-t4c-black)]">
            Learners at<br />Triple 4 Curriculum.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700 max-w-[60ch]">
            The 4-4-4 model is four days a week, four hours a day and four live lessons a day.
            That leaves real space in the school day, and this is what learners do with it:
            coursework on their own screens, books from the library and enrichment like music
            practice.
          </p>
          <Link
            to="/admissions"
            className="inline-flex mt-5 bg-[var(--color-t4c-black)] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest"
          >
            See how admissions work
          </Link>
        </div>
      </div>

      <PageShell>
        <RevealStagger>
          <SectionHeading>Inside the gallery</SectionHeading>
          <Body className="mt-2 max-w-[75ch]">
            Triple 4 Curriculum (T4C) is an online micro-school built on the 4-4-4 model: four
            days a week, four hours a day and four lessons a day, with classes capped at 16
            learners. These photos show the time outside live lessons: independent study,
            reading and enrichment. Updated October 2026.
          </Body>
          <div className="mt-6 columns-1 sm:columns-2 lg:columns-3 gap-4">
            {learnersGallery.map((image) => (
              <figure
                key={image.src}
                className="mb-4 break-inside-avoid bg-white border border-black/10 rounded-[16px] overflow-hidden"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  loading="lazy"
                  decoding="async"
                  className="block w-full h-auto"
                />
                <figcaption className="p-4 text-xs leading-relaxed text-neutral-600">
                  {image.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </RevealStagger>

        <RevealStagger>
          <SectionHeading>Questions about learning at T4C</SectionHeading>
          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            {learnerFaqs.map((faq) => (
              <div key={faq.question} className="bg-white border border-black/10 rounded-[16px] p-5">
                <h3 className="text-sm font-semibold text-[var(--color-t4c-black)]">{faq.question}</h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </RevealStagger>

        <div className="text-center">
          <Link
            to="/how-it-works"
            className="inline-flex bg-[var(--color-t4c-black)] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest"
          >
            How the 4-4-4 works →
          </Link>
        </div>
      </PageShell>
    </div>
  );
}
