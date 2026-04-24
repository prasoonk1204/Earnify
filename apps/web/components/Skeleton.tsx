type SkeletonProps = {
  className?: string;
};

function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded-md bg-[#2A2D3A] ${className}`.trim()} aria-hidden="true" />;
}

export { Skeleton };