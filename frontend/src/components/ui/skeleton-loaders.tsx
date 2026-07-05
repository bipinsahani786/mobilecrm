import { Skeleton } from './skeleton';
import { Card, CardContent } from './card';

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  // Helper to render skeleton cell content based on column count and column index
  const renderCellContent = (colIdx: number) => {
    if (cols === 7) {
      // Commissions page
      switch (colIdx) {
        case 0: // Date
          return <Skeleton className="h-4 w-20" />;
        case 1: // Partner
          return (
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          );
        case 2: // Business / Plan
          return (
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          );
        case 3: // Sale Amount
          return <Skeleton className="h-4 w-16 ml-auto" />;
        case 4: // Commission
          return <Skeleton className="h-4 w-16 ml-auto" />;
        case 5: // Status
          return <Skeleton className="h-5 w-16 mx-auto rounded-full" />;
        case 6: // Actions
          return <Skeleton className="h-8 w-20 ml-auto rounded-md" />;
        default:
          return <Skeleton className="h-4 w-16" />;
      }
    }

    if (cols === 6) {
      // Leads page
      switch (colIdx) {
        case 0: // Date
          return <Skeleton className="h-4 w-16" />;
        case 1: // Business
          return (
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          );
        case 2: // Contact Person
          return (
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
          );
        case 3: // Partner
          return (
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          );
        case 4: // Status
          return <Skeleton className="h-8 w-28 mx-auto rounded-md" />;
        case 5: // Actions
          return <Skeleton className="h-8 w-16 ml-auto rounded-md" />;
        default:
          return <Skeleton className="h-4 w-16" />;
      }
    }

    // Default 5 columns (Tenants / default)
    switch (colIdx) {
      case 0: // Business (with icon box)
        return (
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-md shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        );
      case 1: // Owner details
        return (
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        );
      case 2: // Joined on
        return <Skeleton className="h-4 w-24" />;
      case 3: // Status
        return <Skeleton className="h-5 w-16 rounded" />;
      case 4: // Actions
        return <Skeleton className="h-8 w-20 ml-auto rounded-md" />;
      default:
        return <Skeleton className="h-4 w-16" />;
    }
  };

  const getCellClassName = (colIdx: number) => {
    if (cols === 7) {
      if (colIdx === 3 || colIdx === 4 || colIdx === 6) return "px-4 py-4 text-right";
      if (colIdx === 5) return "px-4 py-4 text-center";
    }
    if (cols === 6) {
      if (colIdx === 4) return "px-4 py-4 text-center";
      if (colIdx === 5) return "px-4 py-4 text-right";
    }
    if (cols === 5) {
      if (colIdx === 4) return "px-4 py-4 text-right";
    }
    return "px-4 py-4";
  };

  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i} className="border-b border-slate-100 dark:border-white/5">
          {[...Array(cols)].map((_, colIdx) => (
            <td key={colIdx} className={getCellClassName(colIdx)}>
              {renderCellContent(colIdx)}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="p-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="space-y-3 mb-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3 grid grid-cols-2 gap-2 mb-4">
              <div><Skeleton className="h-3 w-16 mb-1" /><Skeleton className="h-5 w-20" /></div>
              <div><Skeleton className="h-3 w-24 mb-1" /><Skeleton className="h-5 w-8" /></div>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function PlanCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="flex flex-col h-[380px] p-0">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="w-8 h-8 rounded-md" />
            </div>
            <div className="mb-6 space-y-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex-1 space-y-4">
              <Skeleton className="h-3 w-16 mb-2" />
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-8 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function StatCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </>
  );
}
