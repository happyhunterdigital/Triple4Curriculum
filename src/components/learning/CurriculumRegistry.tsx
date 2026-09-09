import React, { useState } from 'react';
import { ACADEMIC_REGISTRY, type CourseModule } from '../../data/curriculum';

export const CurriculumRegistry: React.FC = () => {
  const [modules] = useState<CourseModule[]>(ACADEMIC_REGISTRY);
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);

  return (
    <section className="w-full max-w-7xl mx-auto py-24 px-6 md:px-12">
      {/* Ledger Header & Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-4 border-b border-[var(--color-prestige-line)]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2">
            Institutional Index // Academic Archive
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-[var(--color-prestige-dark)] font-normal tracking-tight">
            Curriculum Registry & Syllabus Ledger
          </h2>
        </div>
        <div className="mt-4 sm:mt-0 font-mono text-[11px] uppercase tracking-wider text-neutral-400">
          <span>[ Active Ledger Entries: {modules.length} ]</span>
        </div>
      </div>

      {/* Registry Table List */}
      {(
        <div className="border-t border-[var(--color-prestige-line)]">
          {modules.map((module) => {
            const isExpanded = expandedIndex === module.id;
            return (
              <div 
                key={module.id}
                className="border-b border-[var(--color-prestige-line)] group cursor-pointer transition-colors duration-300 hover:bg-neutral-50/60"
                onClick={() => setExpandedIndex(isExpanded ? null : module.id)}
              >
                {/* Row Header Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-8 items-baseline">
                  {/* Meta Column */}
                  <div className="col-span-3 flex items-baseline space-x-4">
                    <span className="font-mono text-xs text-neutral-400">{module.id}</span>
                    <span className="font-mono text-xs tracking-wider uppercase text-neutral-500 font-semibold">{module.code}</span>
                  </div>
                  
                  {/* Core Title Column */}
                  <div className="col-span-6">
                    <h3 className="font-serif text-2xl md:text-3xl text-[var(--color-prestige-dark)] font-normal group-hover:underline decoration-1 underline-offset-4">
                      {module.title}
                    </h3>
                  </div>

                  {/* Minimalist Action Trigger Column */}
                  <div className="col-span-3 text-left md:text-right">
                    <span className="font-mono text-[11px] tracking-widest text-neutral-400 group-hover:text-[var(--color-prestige-dark)] transition-colors font-medium">
                      {isExpanded ? "[ CLOSE INDEX ]" : "[ EXPAND REGISTRY ]"}
                    </span>
                  </div>
                </div>

                {/* Collapsible Ledger Sub-Panel */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px] pb-12' : 'max-h-0'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-[var(--color-prestige-line)]/50">
                    <div className="col-span-3">
                      <p className="font-mono text-[10px] uppercase text-neutral-400 mb-2 tracking-wider">Core Competencies</p>
                      <ul className="space-y-1">
                        {module.frameworks.map((f, i) => (
                          <li key={i} className="font-mono text-xs text-neutral-600 leading-relaxed">- {f}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="col-span-7">
                      <p className="font-mono text-[10px] uppercase text-neutral-400 mb-2 tracking-wider">Technical Documentation</p>
                      <p className="font-sans text-sm text-neutral-600 leading-relaxed max-w-2xl">
                        {module.documentation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
