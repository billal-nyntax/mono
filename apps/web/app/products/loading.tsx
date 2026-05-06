export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="h-8 w-40 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mt-2 h-4 w-24 rounded bg-gray-100 dark:bg-gray-800/60" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-64 rounded-lg bg-gray-100 dark:bg-gray-800" />
          <div className="h-10 w-40 rounded-lg bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <div className="hidden h-96 rounded-xl bg-gray-100 dark:bg-gray-800 lg:block" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
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
