import { teamMembers, teamPhotoSrcSet, type TeamMember } from '../../data/team';

/**
 * T4C leadership org chart — visual hierarchy for the About page "Our Team"
 * section. Principal → Vice Principal → Head of Administration, with the rest
 * of the team in a clean, responsive grid beneath.
 *
 * Mobile-first: tighter vertical chain, smaller avatars, and a 2-column grid
 * for the wider team so the hierarchy stays readable on small screens.
 * Portraits keep their original colour and are centred inside the rings.
 */

type RingSize = 'lead' | 'member';

const sizeClasses: Record<RingSize, string> = {
  lead: 'w-[96px] h-[96px] sm:w-[132px] sm:h-[132px]',
  member: 'w-[76px] h-[76px] sm:w-[104px] sm:h-[104px]',
};

function Ring({ member, ringClass, size }: { member: TeamMember; ringClass: string; size: RingSize }) {
  return (
    <div className="flex flex-col items-center text-center w-full">
      <div
        className={`rounded-full p-[5px] sm:p-[6px] flex items-center justify-center mb-2 sm:mb-3 shadow-md ${sizeClasses[size]} ${ringClass}`}
      >
        <img
          src={member.photo}
          srcSet={teamPhotoSrcSet(member.photo)}
          sizes={size === 'lead' ? '(min-width: 640px) 132px, 96px' : '(min-width: 1024px) 104px, 76px'}
          width={member.width}
          height={member.height}
          alt={member.alt}
          loading="lazy"
          decoding="async"
          className="w-full h-full rounded-full object-cover object-center bg-slate-100"
        />
      </div>
      <h3 className="m-0 text-[0.78rem] sm:text-[0.9rem] font-bold tracking-[0.03em] text-gray-700 leading-tight">
        {member.name}
      </h3>
      <p className="mt-0.5 mb-0 text-[0.7rem] sm:text-[0.8rem] text-gray-500 max-w-[140px] sm:max-w-[160px] leading-snug">
        {member.role}
      </p>
    </div>
  );
}

/** Short vertical connector with a downward arrow. */
const ArrowDown = () => (
  <div className="w-px h-6 sm:h-10 bg-gray-400 relative my-2 sm:my-3 after:content-['▼'] after:absolute after:bottom-[-6px] after:left-1/2 after:-translate-x-1/2 after:text-[8px] after:text-gray-400" />
);

const StemDown = () => <div className="w-px h-5 sm:h-7 bg-gray-400 mt-2 sm:mt-3" />;

const BranchArrowDown = () => (
  <div className="w-px h-5 sm:h-7 bg-gray-400 relative mb-2 sm:mb-3 after:content-['▼'] after:absolute after:bottom-[-6px] after:left-1/2 after:-translate-x-1/2 after:text-[8px] after:text-gray-400" />
);

export function TeamOrgChart() {
  const principal = teamMembers.find((m) => m.featured);
  const vice = teamMembers.find((m) => m.role === 'Vice Principal');
  const headAdmin = teamMembers.find((m) => m.name === 'Beaulah Ntoni');
  const rest = teamMembers.filter(
    (m) => m !== principal && m !== vice && m !== headAdmin,
  );

  if (!principal || !vice || !headAdmin) return null;

  return (
    <div className="w-full overflow-x-auto">
      {/* Curved brand header */}
      <header className="bg-[var(--color-t4c-green)] text-white text-center py-10 sm:py-16 mb-6 sm:mb-10 rounded-b-[50%_40px] sm:rounded-b-[50%_60px]">
        <span className="text-2xl sm:text-4xl font-extrabold tracking-tight inline-flex items-center gap-2">
          ❖ Our Team
        </span>
      </header>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-10 sm:pb-16 flex flex-col items-center">
        {/* Tier 1: Principal */}
        <Ring member={principal} ringClass="bg-[var(--color-t4c-green)]" size="lead" />

        <ArrowDown />

        {/* Tier 2: Vice Principal */}
        <Ring member={vice} ringClass="bg-[var(--color-t4c-yellow)]" size="lead" />

        <StemDown />

        {/* Tier 3: Head of Administration */}
        <BranchArrowDown />
        <Ring member={headAdmin} ringClass="bg-[var(--color-t4c-black)]" size="lead" />

        {/* Rest of the team: tidy responsive grid */}
        <div className="mt-8 sm:mt-10 w-full">
          <p className="text-center text-[0.7rem] sm:text-[0.72rem] font-mono uppercase tracking-widest text-gray-400 mb-4 sm:mb-6">
            Team
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-8 items-start justify-items-center">
            {rest.map((member) => (
              <Ring
                key={member.name}
                member={member}
                ringClass="bg-[var(--color-t4c-green)]"
                size="member"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
