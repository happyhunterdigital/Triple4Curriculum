import { teamMembers, teamPhotoSrcSet, type TeamMember } from '../../data/team';

/**
 * T4C leadership org chart — visual hierarchy for the About page "Our Team"
 * section. Principal → Vice Principal → Head of Administration, with the rest
 * of the team shown as a sub-team rail under the Head of Administration.
 *
 * Built with Tailwind only (no co-located CSS) to match the rest of the site.
 * Brand colours drive the avatar rings; portraits are grayscale like the
 * reference chart.
 */

function Ring({ member, ringClass }: { member: TeamMember; ringClass: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`w-[92px] h-[92px] rounded-full p-[5px] flex items-center justify-center mb-3 shadow-md ${ringClass}`}
      >
        <img
          src={member.photo}
          srcSet={teamPhotoSrcSet(member.photo)}
          sizes="92px"
          width={member.width}
          height={member.height}
          alt={member.alt}
          loading="lazy"
          decoding="async"
          className="w-full h-full rounded-full object-cover grayscale bg-slate-200"
        />
      </div>
      <h3 className="m-0 text-[0.85rem] font-bold tracking-[0.03em] text-gray-600">
        {member.name}
      </h3>
      <p className="mt-0.5 mb-0 text-[0.78rem] text-gray-500 max-w-[160px] leading-snug">
        {member.role}
      </p>
    </div>
  );
}

const ArrowDown = ({ className = '' }: { className?: string }) => (
  <div
    className={`w-px h-9 bg-gray-400 relative my-3 after:content-['▼'] after:absolute after:bottom-[-6px] after:left-1/2 after:-translate-x-1/2 after:text-[8px] after:text-gray-400 ${className}`}
  />
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

      <div className="max-w-[1050px] mx-auto px-6 pb-16 flex flex-col items-center">
        {/* Tier 1: Principal */}
        <Ring member={principal} ringClass="bg-[var(--color-t4c-green)]" />

        <ArrowDown />

        {/* Tier 2: Vice Principal */}
        <Ring member={vice} ringClass="bg-[var(--color-t4c-yellow)]" />

        <StemDown />

        {/* Tier 3: Head of Administration */}
        <BranchArrowDown />
        <Ring member={headAdmin} ringClass="bg-[var(--color-t4c-black)]" />

        {/* Sub-team rail: the rest of the team */}
        <ul className="list-none m-0 p-0 pl-5 w-full max-w-[195px] relative before:content-[''] before:absolute before:top-[-45px] before:left-0 before:bottom-[18px] before:w-px before:bg-gray-400">
          {rest.map((member) => (
            <li
              key={member.name}
              className="relative pl-[1.15rem] mb-5 text-left before:content-[''] before:absolute before:top-2 before:left-[-1.25rem] before:w-[1.1rem] before:h-px before:bg-gray-400"
            >
              <span className="absolute top-[1px] left-[-0.25rem] text-[9px] text-gray-400">
                ▸
              </span>
              <h5 className="m-0 text-[0.74rem] font-bold text-gray-600">
                {member.name}
              </h5>
              <p className="mt-0.5 mb-0 text-[0.72rem] text-gray-500 leading-snug">
                {member.role}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
