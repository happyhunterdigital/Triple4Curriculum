import React from 'react';

export const SkeletonBox: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-neutral-200 animate-pulse rounded-none ${className}`} />
);

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner Skeleton */}
      <div className="bg-white p-4 border border-neutral-300 rounded-none shadow-none flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SkeletonBox className="w-32 h-8" />
          <SkeletonBox className="w-40 h-8" />
        </div>
        <SkeletonBox className="w-48 h-6" />
      </div>

      {/* Attendance Summary Alert Skeleton */}
      <div className="bg-white p-5 sm:p-6 border border-neutral-300 rounded-none shadow-none">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <SkeletonBox className="w-28 h-5" />
              <SkeletonBox className="w-36 h-5" />
            </div>
            <SkeletonBox className="w-72 h-7" />
            <SkeletonBox className="w-96 h-4" />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <SkeletonBox className="w-28 h-10" />
            <SkeletonBox className="w-36 h-10" />
          </div>
        </div>
      </div>

      {/* Hero & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-neutral-300 rounded-none shadow-none p-6 space-y-4">
          <SkeletonBox className="w-32 h-5" />
          <SkeletonBox className="w-full h-48" />
          <SkeletonBox className="w-3/4 h-8" />
          <SkeletonBox className="w-full h-4" />
        </div>

        <div className="lg:col-span-4 bg-white border border-neutral-300 rounded-none shadow-none p-6 space-y-4">
          <SkeletonBox className="w-32 h-5" />
          <SkeletonBox className="w-full h-20" />
          <SkeletonBox className="w-full h-4" />
          <SkeletonBox className="w-full h-10" />
        </div>
      </div>

      {/* 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white border border-neutral-300 rounded-none shadow-none p-6 space-y-4">
            <SkeletonBox className="w-24 h-5" />
            <SkeletonBox className="w-full h-8" />
            <SkeletonBox className="w-full h-16" />
            <SkeletonBox className="w-full h-10" />
          </div>
        ))}
      </div>

    </div>
  );
};
