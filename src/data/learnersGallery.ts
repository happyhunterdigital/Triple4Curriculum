export interface LearnerImage {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  /** Which edge to anchor when a tile has to crop - keeps heads in frame. */
  focus?: 'top' | 'center' | 'bottom';
}

/**
 * Learner gallery. File names, alt text and captions are deliberately
 * consistent so search engines and answer engines associate each photo with
 * Triple 4 Curriculum. See docs/learners-gallery-seo.md before editing: the
 * alt text describes the actual photo and never keyword stuffs.
 *
 * Shown as a waterfall masonry at each photo's natural aspect ratio. The order
 * alternates music, study and reading so the columns fill with a mix rather
 * than a run of near-identical shots.
 */
export const learnersGallery: LearnerImage[] = [
  {
    src: '/images/learners/triple-4-curriculum-learner-piano-practice.jpg',
    alt: 'Learner reading sheet music while playing a Casio digital piano in a music room.',
    caption: 'Me time at the keys, from real sheet music.',
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
    src: '/images/learners/triple-4-curriculum-learner-violin-practice.jpg',
    alt: 'Learner playing the violin in a study room, with a world map and an alphabet chart on the wall behind her.',
    caption: 'Me time in the study room: bow to string.',
    width: 1136,
    height: 1840,
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-notebook-revision.jpg',
    alt: 'Learner in a red hoodie reading a marbled notebook at a desk, with a study planner listing Maths, History and Science behind him.',
    caption: 'A plan on the wall, a notebook in hand.',
    width: 1157,
    height: 2048,
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-reading-pink-dress.jpg',
    alt: 'Learner in a pink floral dress reading an open book, with a world map and colour-coded notes on the wall behind her.',
    caption: 'Reading, with the map and the plan in reach.',
    width: 718,
    height: 1228,
  },
  {
    src: 'https://res.cloudinary.com/x4agmmbo/image/upload/v1794383114/T4C_extra_mual_activity.jpg',
    alt: 'Teen learner in a yellow T-shirt playing an upright piano with sheet music open and a eucalyptus plant beside her.',
    caption: 'Me time after the school day: her own piano, her own pace.',
    width: 896,
    height: 1754,
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-piano-lesson.jpg',
    alt: 'Learner at a Casio piano with sheet music open, looking up from the keys.',
    caption: 'Hobby hours build confidence on the keys.',
    width: 1205,
    height: 1487,
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-homeschool-desk.jpg',
    alt: 'Learner at a wooden desk with a laptop, calculator and folders beneath a homeschool weekly schedule board and a world map.',
    caption: 'The week\u2019s schedule, pinned above the desk.',
    width: 1376,
    height: 1824,
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-reading-sofa.jpg',
    alt: 'Learner in a dark hoodie reading a Pirates of the Caribbean book on a grey sofa, with a homeschool schedule board and bookshelves behind him.',
    caption: 'A chapter before the next lesson.',
    width: 1376,
    height: 1824,
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-library-research.jpg',
    alt: 'Learner using a Chromebook at a round table in the library, beneath the 330 Economics shelf sign.',
    caption: 'Research happens where the books are.',
    width: 880,
    height: 1600,
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-writing-exercise-book.jpg',
    alt: 'Learner in a red hoodie writing in an open exercise book at a wooden desk, with a stack of books and a pinboard behind him.',
    caption: 'Handwritten notes, one subject at a time.',
    width: 937,
    height: 1677,
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-music-practice.jpg',
    alt: 'Learner playing a Casio piano from sheet music in a blue-walled music room.',
    caption: 'The music room, mid me-time practice.',
    width: 1465,
    height: 1465,
    focus: 'center',
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-macbook-desk.jpg',
    alt: 'Learner in a grey hoodie and black beanie typing on a MacBook at a school desk, with a Learn Grow Discover sign above the bookshelves.',
    caption: 'Coursework at his own desk.',
    width: 896,
    height: 1279,
  },
  {
    src: '/images/learners/triple-4-curriculum-learners-reading-together.jpg',
    alt: 'Two learners reading side by side on a green circular sofa in front of library shelves.',
    caption: 'Different books, same room.',
    width: 1600,
    height: 1415,
    focus: 'center',
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-piano-confidence.jpg',
    alt: 'Smiling learner at a Casio piano with sheet music open, one hand raised over the keys.',
    caption: 'After-lessons hobby: practice, then a look at the camera.',
    width: 1451,
    height: 1597,
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-reading-museum.jpg',
    alt: 'Learner reading an open book on a colourful armchair beside a window, with the Hackney Museum entrance behind her.',
    caption: 'Reading, in her own time.',
    width: 995,
    height: 1600,
  },
  {
    src: '/images/learners/triple-4-curriculum-learner-typing-coursework.jpg',
    alt: 'Learner in a tie-dye t-shirt typing on a laptop on a turquoise sofa beside plants.',
    caption: 'Independent study, with a mentor close by.',
    width: 1172,
    height: 1318,
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
      'They complete independent study on Chromebooks and laptops, read in the library and enjoy me time — hobbies such as music practice, at their own pace after the school day.',
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
