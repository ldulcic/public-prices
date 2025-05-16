import { getItems } from "@/lib/api"
import Link from "next/link"
import Image from "next/image"

export async function ItemGrid({ searchParams }: { searchParams?: { search?: string } }) {
  const searchQuery = searchParams?.search || ""
  const items = await getItems(searchQuery)

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {searchQuery ? `No items found for "${searchQuery}". Try a different search term.` : "No items found."}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/items/${item.id}`}
          className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="aspect-square relative">
            <Image
              src={item.image || "/placeholder.svg?height=200&width=200"}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
          </div>
          <div className="p-4">
            <h3 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">{item.name}</h3>
            <p className="text-sm text-gray-500 mt-1">From ${item.lowestPrice.toFixed(2)}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
