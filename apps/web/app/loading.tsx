export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="h-6 w-48 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="h-12 w-3/4 rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800/60" />
            <div className="h-4 w-2/3 rounded bg-gray-100 dark:bg-gray-800/60" />
            <div className="mt-4 flex gap-3">
              <div className="h-12 w-32 rounded-xl bg-gray-200 dark:bg-gray-800" />
              <div className="h-12 w-32 rounded-xl bg-gray-100 dark:bg-gray-800/60" />
            </div>
          </div>
          <div className="hidden h-64 rounded-2xl bg-gray-100 dark:bg-gray-800 lg:block" />
        </div>
      </div>

      {/* Categories skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      </div>

      {/* Products skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800" />
              <div className="space-y-2 p-4">
                <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
                <div className="h-6 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
