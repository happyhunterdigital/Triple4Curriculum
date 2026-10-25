# Learner gallery: SEO, GEO and AEO notes

Last updated: October 2026. Applies to `/learners` and `public/images/learners/`.

## What is wired in

- Images live in `public/images/learners/` with descriptive file names.
- Metadata lives in `src/data/learnersGallery.ts`: alt text, visible caption,
  width and height for every photo. The page renders them as figure and
  figcaption, so the caption is real visible text, not only alt text.
- `src/pages/LearnersPage.tsx` emits ImageGallery and FAQPage JSON-LD on mount
  and sets the title, meta description and canonical for the page.
- `public/sitemap.xml` lists `/learners` with image sitemap entries.
- The FAQ answers on the page and in the schema come from the same array, so
  they can never drift apart.

## Rules before editing

1. One spelling of the name everywhere: Triple 4 Curriculum, or Triple 4C.
   Never "Tripple4Curriculm". Entity consistency is a direct AI answer signal.
2. Alt text describes the photo, under 125 characters, no "image of", no
   keyword stuffing. If you change a photo, rewrite the alt from the photo.
3. Keep the caption visible on the page. Answer engines quote visible text.
4. File names stay descriptive when new photos are added, in the same pattern:
   triple-4-curriculum-learner-<activity>.jpg
5. Every new photo must have explicit width and height set to avoid layout
   shift, plus loading="lazy" and decoding="async".

## Alt text and captions in use

| File | Alt text |
| --- | --- |
| learner-piano-practice.jpg | Learner reading sheet music while playing a Casio digital piano in a music room. |
| learner-online-coursework.jpg | Learner in a pink outfit working through coursework on a laptop from a green sofa. |
| learner-chromebook-reading.jpg | Learner at a library table with a Chromebook and graphic novel editions of the Iliad and the Odyssey. |
| learner-iliad-odyssey.jpg | Smiling learner with a Chromebook, a stack of Iliad and Odyssey books, and a tin of colouring pencils. |
| learner-typing-coursework.jpg | Learner in a tie-dye t-shirt typing on a laptop on a turquoise sofa beside plants. |
| learner-study-by-window.jpg | Learner typing on a laptop on a turquoise sofa by a window, bookshelves reflected in the glass. |
| learner-reading-break.jpg | Smiling learner holding an open paperback, a laptop open on the table in front of her. |
| learner-library-research.jpg | Learner using a Chromebook at a round table in the library, beneath the 330 Economics shelf sign. |
| learners-reading-together.jpg | Two learners reading side by side on a green circular sofa in front of library shelves. |
| learner-piano-lesson.jpg | Learner at a Casio piano with sheet music open, looking up from the keys. |
| learner-music-practice.jpg | Learner playing a Casio piano from sheet music in a blue-walled music room. |
| learner-piano-confidence.jpg | Smiling learner at a Casio piano with sheet music open, one hand raised over the keys. |

One Cloudinary asset was submitted twice (learner1 and learner10 are the same
bytes). Only one copy is published, so the gallery does not ship duplicate
images.

## GEO checklist

1. Entity consistency: Triple 4 Curriculum, Triple 4C and triple4c.com used the
   same way across the site, schema and social profiles.
2. Facts near the images: the intro and summary paragraphs sit within one
   screen of the gallery grid.
3. Visible captions are published for every photo, matching the alt text.
4. ImageGallery, FAQPage and the EducationalOrganization reference are emitted
   as JSON-LD on the page.
5. Sitemap: `/learners` is listed with image entries and submitted in Google
   Search Console and Bing Webmaster Tools.
6. Internal links: the gallery is linked from the primary navigation, the
   footer and the admissions page, with descriptive anchor text.
7. Freshness: the "Updated October 2026" line should change whenever the
   gallery changes.

## AEO checklist

1. First clean sentence: "Triple 4 Curriculum (T4C) is an online micro-school
   built on the 4-4-4 model."
2. Question-shaped headings answered in 40 words or fewer.
3. Concrete nouns that retrieval systems can match: Chromebooks, library,
   piano, sheet music, Grade R to Grade 12, National Senior Certificate.
4. FAQPage schema mirrors the visible FAQ exactly, in the same order.
5. If the gallery moves to its own route later, keep one topic per URL.

## Consent and privacy

The photos show identifiable young people. The site already publishes a Child
Protection page; confirm the school holds photo consent for every learner shown,
and keep the images out of any public channel where consent was not given.
