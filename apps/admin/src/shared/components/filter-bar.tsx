import { type ReactNode } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface FilterBarProps {
  readonly children: ReactNode;
  readonly searchValue: string;
  readonly searchPlaceholder?: string;
  readonly onSearchChange: (value: string) => void;
  readonly isFetching?: boolean;
  readonly hasActiveFilters?: boolean;
  readonly onClearFilters?: () => void;
}

export function FilterBar({
  children,
  searchValue,
  searchPlaceholder = 'Search...',
  onSearchChange,
  isFetching,
  hasActiveFilters,
  onClearFilters,
}: FilterBarProps) {
  return (
    <div className="card p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Search Input */}
        <div className="relative w-full flex-1 sm:min-w-[200px] sm:w-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-9 text-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-gray-800"
          />
          {isFetching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-blue-600" />
          )}
        </div>

        {/* Filter Controls */}
        {children}

        {/* Clear Filters */}
        {hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-red-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-red-400"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

interface FilterSelectProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly children: ReactNode;
  readonly className?: string;
}

export function FilterSelect({ value, onChange, children, className = '' }: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm text-gray-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 ${className}`}
    >
      {children}
    </select>
  );
}

interface FilterCheckboxProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}

export function FilterCheckbox({ label, checked, onChange }: FilterCheckboxProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
      />
      <span>{label}</span>
    </label>
  );
}
