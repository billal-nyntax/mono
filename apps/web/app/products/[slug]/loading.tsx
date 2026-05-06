export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 h-5 w-32 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="space-y-4">
          <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-5 w-32 rounded bg-gray-100 dark:bg-gray-800/60" />
          <div className="h-10 w-40 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-36 rounded bg-gray-100 dark:bg-gray-800/60" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800/60" />
            <div className="h-4 w-5/6 rounded bg-gray-100 dark:bg-gray-800/60" />
            <div className="h-4 w-4/6 rounded bg-gray-100 dark:bg-gray-800/60" />
          </div>
          <div className="mt-6 h-12 w-48 rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  );
}
