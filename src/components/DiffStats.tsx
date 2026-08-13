import type { DiffStats as DiffStatsType } from '../types/diff';

interface DiffStatsProps {
  stats: DiffStatsType;
}

export function DiffStats({ stats }: DiffStatsProps) {
  const { added, removed, modified, unchanged, totalHunks } = stats;
  const hasContent = added + removed + modified + unchanged > 0;

  if (!hasContent) return null;

  const isIdentical = added === 0 && removed === 0 && modified === 0;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 shrink-0">
      {isIdentical ? (
        <span className="font-medium text-green-600 dark:text-green-400">
          Files are identical
        </span>
      ) : (
        <>
          {added > 0 && (
            <span className="flex items-center gap-1.5 font-medium text-green-700 dark:text-green-400">
              <span className="w-2 h-2 rounded-sm bg-green-500 inline-block" />+{added} added
            </span>
          )}
          {removed > 0 && (
            <span className="flex items-center gap-1.5 font-medium text-red-700 dark:text-red-400">
              <span className="w-2 h-2 rounded-sm bg-red-500 inline-block" />-{removed} removed
            </span>
          )}
          {modified > 0 && (
            <span className="flex items-center gap-1.5 font-medium text-amber-700 dark:text-amber-400">
              <span className="w-2 h-2 rounded-sm bg-amber-500 inline-block" />~{modified} modified
            </span>
          )}
          {unchanged > 0 && (
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <span className="w-2 h-2 rounded-sm bg-gray-300 dark:bg-gray-600 inline-block" />
              {unchanged} unchanged
            </span>
          )}
        </>
      )}
      {totalHunks > 0 && (
        <span className="ml-auto text-gray-400 dark:text-gray-500">
          {totalHunks} hunk{totalHunks !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
