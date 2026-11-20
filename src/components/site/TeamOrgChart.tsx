import { teamMembers, teamPhotoSrcSet, type TeamMember } from '../../data/team';

/**
 * T4C leadership org chart — visual hierarchy for the About page "Our Team"
 * section. Principal → Vice Principal → Head of Administration, with the rest
 * of the team shown as a horizontal row of colour portraits beneath.
 *
 * Built with Tailwind only (no co-located CSS) to match the rest of the site.
 * Portraits keep their original colour (no grayscale) and are sized to fit
 * the avatar ring.
 */

function Ring({ member, ringClass, size = 120 }: { member: TeamMember; ringClass: string; size?: number }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`rounded-full p-[6px] flex items-center justify-center mb-3 shadow-md ${ringClass}`}
        style={{ width: size, height: size }}
      >
        <img
          src={member.photo}
          srcSet={teamPhotoSrcSet(member.photo)}
          sizes={`${size}px`}
          width={member.width}
          height={member.height}
          alt={member.alt}
          loading="lazy"
          decoding="async"
          className="w-full h-full rounded-full object-cover object-center bg-slate-100"
        />
      </div>
      <h3 className="m-0 text-[0.9rem] font-bold tracking-[0.03em] text-gray-700">
        {member.name}
      </h3>
      <p className="mt-0.5 mb-0 text-[0.8rem] text-gray-500 max-w-[160px] leading-snug">
        {member.role}
      </p>
    </div>
  );
}

const ArrowDown = () => (
  <div className="w-px h-10 bg-gray-400 relative my-3 after:content-['▼'] after:absolute after:bottom-[-6px] after:left-1/2 after:-translate-x-1/2 after:text-[8px] after:text-gray-400" />
);

const StemDown = () => <div className="w-px h-7 bg-gray-400 mt-3" />;

const BranchArrowDown = () => (
  <div className="w-px h-7 bg-gray-400 relative mb-3 after:content-['▼'] after:absolute after:bottom-[-6px] after:left-1/2 after:-translate-x-1/2 after:text-[8px] after:text-gray-400" />
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
      <header className="bg-[var(--color-t4c-green)] text-white text-center py-14 sm:py-16 mb-10 rounded-b-[50%_60px]">
        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight inline-flex items-center gap-2">
          ❖ Our Team
        </span>
      </header>

      <div className="max-w-[1100px] mx-auto px-6 pb-16 flex flex-col items-center">
        {/* Tier 1: Principal */}
        <Ring member={principal} ringClass="bg-[var(--color-t4c-green)]" size={132} />

        <ArrowDown />

        {/* Tier 2: Vice Principal */}
        <Ring member={vice} ringClass="bg-[var(--color-t4c-yellow)]" size={132} />

        <StemDown />

        {/* Tier 3: Head of Administration */}
        <BranchArrowDown />
        <Ring member={headAdmin} ringClass="bg-[var(--color-t4c-black)]" size={132} />

        {/* Rest of the team in a single horizontal row */}
        <div className="mt-10 w-full">
          <p className="text-center text-[0.72rem] font-mono uppercase tracking-widest text-gray-400 mb-6">
            Team
          </p>
          <div className="flex flex-wrap items-start justify-center gap-6 sm:gap-8">
            {rest.map((member) => (
              <Ring
                key={member.name}
                member={member}
                ringClass="bg-[var(--color-t4c-green)]"
                size={104}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
