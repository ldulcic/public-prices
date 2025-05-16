export function ItemsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="aspect-square bg-gray-200 animate-pulse" />
          <div className="p-4">
            <div className="h-5 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ItemDetailsLoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-6" />

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0 md:w-1/3">
            <div className="h-64 md:h-96 bg-gray-200 animate-pulse" />
          </div>
          <div className="p-6 md:p-8 md:w-2/3">
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-6 w-3/4" />

            <div className="h-6 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
