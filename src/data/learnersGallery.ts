export interface LearnerImage {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

/**
 * Learner gallery. File names, alt text and captions are deliberately
 * consistent so search engines and answer engines associate each photo with
 * Triple 4 Curriculum. See docs/learners-gallery-seo.md before editing: the
 * alt text describes the actual photo and never keyword stuffs.
 */
export const learnersGallery: LearnerImage[] = [
  {
    src: '/images/learners/triple-4-curriculum-learner-piano-practice.jpg',
    alt: 'Learner reading sheet music while playing a Casio digital piano in a music room.',
    caption: 'Practice on the keys, from real sheet music.',
    width: 1322,
    height: 1450,
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-online-coursework.jpg',
    alt: 'Learner in a pink outfit working through coursework on a laptop from a green sofa.',
    caption: 'Coursework at the learner\u2019s own pace.',
    width: 1223,
    height: 1396,
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-chromebook-reading.jpg',
    alt: 'Learner at a library table with a Chromebook and graphic novel editions of the Iliad and the Odyssey.',
    caption: 'Screens and books share the table.',
    width: 701,
    height: 1600,
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-iliad-odyssey.jpg',
    alt: 'Smiling learner with a Chromebook, a stack of Iliad and Odyssey books, and a tin of colouring pencils.',
    caption: 'The classics, a Chromebook and colouring pencils.',
    width: 1059,
    height: 1600,
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-typing-coursework.jpg',
    alt: 'Learner in a tie-dye t-shirt typing on a laptop on a turquoise sofa beside plants.',
    caption: 'Independent study, with a mentor close by.',
    width: 1172,
    height: 1318,
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-study-by-window.jpg',
    alt: 'Learner typing on a laptop on a turquoise sofa by a window, bookshelves reflected in the glass.',
    caption: 'A quiet corner, and work that gets finished.',
    width: 1352,
    height: 1298,
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-reading-break.jpg',
    alt: 'Smiling learner holding an open paperback, a laptop open on the table in front of her.',
    caption: 'Reading for pleasure counts.',
    width: 985,
    height: 1599,
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-library-research.jpg',
    alt: 'Learner using a Chromebook at a round table in the library, beneath the 330 Economics shelf sign.',
    caption: 'Research happens where the books are.',
    width: 880,
    height: 1600,
  },
  {
    src: '/images/learners/triple-4-curriculum-learners-reading-together.jpg',
    alt: 'Two learners reading side by side on a green circular sofa in front of library shelves.',
    caption: 'Different books, same room.',
    width: 1600,
    height: 1415,
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-piano-lesson.jpg',
    alt: 'Learner at a Casio piano with sheet music open, looking up from the keys.',
    caption: 'Confidence on the keys.',
    width: 1205,
    height: 1487,
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-music-practice.jpg',
    alt: 'Learner playing a Casio piano from sheet music in a blue-walled music room.',
    caption: 'The music room, mid-practice.',
    width: 1465,
    height: 1465,
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-piano-confidence.jpg',
    alt: 'Smiling learner at a Casio piano with sheet music open, one hand raised over the keys.',
    caption: 'Practice, then a look at the camera.',
    width: 1451,
    height: 1597,
  },
];

export interface LearnerFaq {
  question: string;
  answer: string;
}

/**
 * Visible FAQ block. The same questions and answers feed the FAQPage schema on
 * the page. Keep them in sync: mismatched schema and visible text loses trust.
 */
export const learnerFaqs: LearnerFaq[] = [
  {
    question: 'What is Triple 4 Curriculum?',
    answer:
      'Triple 4 Curriculum (T4C) is an online micro-school built on the 4-4-4 model: four days a week, four hours a day and four lessons a day, with classes capped at 16 learners.',
  },
  {
    question: 'What does the 4-4-4 model mean?',
    answer:
      'Four days of live school a week, four hours of live teaching a day and four live lessons a day. The rest of the week is independent study, homework and skill projects.',
  },
  {
    question: 'What do learners do outside live lessons?',
    answer:
      'They complete independent study on Chromebooks and laptops, read in the library and use the time for enrichment such as music practice.',
  },
  {
    question: 'Do learners use laptops and Chromebooks?',
    answer:
      'Yes. Coursework runs on Chromebooks and laptops during self-directed study time.',
  },
  {
    question: 'Which grades does Triple 4C cover?',
    answer:
      'Grade R to Grade 12, with learners across Africa and internationally working towards a National Senior Certificate.',
  },
  {
    question: 'How do I apply?',
    answer:
      'Applications start on the admissions page at https://triple4c.com/admissions.',
  },
];
