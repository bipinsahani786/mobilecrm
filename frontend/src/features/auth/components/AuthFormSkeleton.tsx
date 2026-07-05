import { Skeleton } from "@/components/ui/skeleton";

export const AuthFormSkeleton = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 bg-zinc-800" />
        <Skeleton className="h-[68px] w-full rounded-2xl bg-zinc-800" />
      </div>
      <Skeleton className="h-[68px] w-full rounded-2xl mt-8 bg-zinc-800/80" />
    </div>
  );
};
