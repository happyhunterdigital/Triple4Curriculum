/**
 * T4C leadership & teaching team, shown in the About page "Our Team" section.
 *
 * Photos are Cloudinary-hosted portraits (same CDN as the rest of the site).
 * Keep alt text factual — it feeds the page's Person schema and search engines.
 */

export interface TeamMember {
  name: string;
  role: string;
  photo: string;
  alt: string;
  width: number;
  height: number;
  /** Rendered with a highlighted card (yellow border + Leadership tag). */
  featured?: boolean;
}

export const teamMembers: TeamMember[] = [
  {
    name: 'Wonder Ngwenya',
    role: 'Principal',
    photo: 'https://res.cloudinary.com/x4agmmbo/image/upload/v1794983761/Wonder_Ngwenya.jpg',
    alt: 'Wonder Ngwenya, Principal at Triple 4 Curriculum.',
    width: 1080,
    height: 1290,
    featured: true,
  },
  {
    name: 'Eric Mongesi Mpofu',
    role: 'Vice Principal',
    photo: 'https://res.cloudinary.com/x4agmmbo/image/upload/v1794406582/Eric_Mongesi_Mpofu_Head_of_Business_Department.jpg',
    alt: 'Eric Mongesi Mpofu, Vice Principal at Triple 4 Curriculum.',
    width: 1024,
    height: 1024,
  },
  {
    name: 'Motshidisi',
    role: 'English Teacher',
    photo: 'https://res.cloudinary.com/x4agmmbo/image/upload/v1794496367/Motshidisi_English.jpg',
    alt: 'Motshidisi, English teacher at Triple 4 Curriculum.',
    width: 896,
    height: 1200,
  },
  {
    name: 'Ability Ncube',
    role: 'Head of Primary',
    photo: 'https://res.cloudinary.com/x4agmmbo/image/upload/v1794495423/Ability_Ncube_Head_of_Primary.jpg',
    alt: 'Ability Ncube, Head of Primary at Triple 4 Curriculum.',
    width: 896,
    height: 1200,
  },
  {
    name: 'Lungile Mkhulise',
    role: 'Head of Safeguarding',
    photo: 'https://res.cloudinary.com/x4agmmbo/image/upload/v1794983761/Lungile_Mkhulise.jpg',
    alt: 'Lungile Mkhulise, Head of Safeguarding at Triple 4 Curriculum.',
    width: 1122,
    height: 1402,
  },
  {
    name: 'Sithabile Mpofu',
    role: 'Teacher',
    photo: 'https://res.cloudinary.com/x4agmmbo/image/upload/v1794983761/Sithabile_Mpofu.jpg',
    alt: 'Sithabile Mpofu, teacher at Triple 4 Curriculum.',
    width: 690,
    height: 1336,
  },
  {
    name: 'Steven Ngombo',
    role: 'Teacher',
    photo: 'https://res.cloudinary.com/x4agmmbo/image/upload/v1794983761/Steven_Ngombo.jpg',
    alt: 'Steven Ngombo, teacher at Triple 4 Curriculum.',
    width: 1157,
    height: 1360,
  },
  {
    name: 'Cilvia Moragwa',
    role: 'English Language & Literature Teacher',
    photo: 'https://res.cloudinary.com/x4agmmbo/image/upload/v1794983762/Cilvia_Moragwa.jpg',
    alt: 'Cilvia Moragwa, English Language and Literature teacher at Triple 4 Curriculum.',
    width: 2902,
    height: 2967,
  },
];

/**
 * Responsive srcSet of face-centred crops for the uniform 4:5 team cards.
 * (cloudinarySrcSet can't be reused here: it skips already-transformed URLs.)
 */
export function teamPhotoSrcSet(url: string): string {
  return ([320, 480, 640] as const)
    .map((w) => `${cloudinaryFillTeam(url, w, Math.round(w * 1.25))} ${w}w`)
    .join(', ');
}

function cloudinaryFillTeam(url: string, width: number, height: number): string {
  const marker = '/image/upload/';
  if (!url.includes('res.cloudinary.com/') || !url.includes(marker)) return url;
  const [base, rest] = url.split(marker);
  if (!base || !rest) return url;
  return `${base}${marker}f_auto,q_auto,w_${width},h_${height},c_fill,g_face/${rest}`;
}
