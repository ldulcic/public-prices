"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { SearchBar } from "./search-bar"
import { ItemsLoadingSkeleton } from "./loading-skeletons"
import { getItems } from "@/lib/api"
import type { Item } from "@/lib/types"
import { AddToCartButton } from "./add-to-cart-button"
import { AlertCircle } from "lucide-react"
import { formatPrice } from "@/lib/utils"

export function ItemList() {
  const [allItems, setAllItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Fetch all items on component mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log("Fetching items...")
        const items = await getItems()
        console.log(`Fetched ${items.length} items`)
        setAllItems(items)
        setFilteredItems(items)
      } catch (err) {
        console.error("Error fetching items:", err)
        setError(err instanceof Error ? err.message : "Failed to load items. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchItems()
  }, [])

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setIsSearching(true)

    try {
      if (!query.trim()) {
        setFilteredItems(allItems)
      } else {
        const filtered = allItems.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
        setFilteredItems(filtered)
      }
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div>
      <div className="max-w-2xl mx-auto mb-8">
        <SearchBar onSearch={handleSearch} isLoading={isSearching} />
      </div>

      {isLoading ? (
        <div>
          <p className="text-center text-gray-500 mb-4">Loading items... This may take a few seconds.</p>
          <ItemsLoadingSkeleton />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium mb-2">Error loading items</p>
          <p className="text-gray-500 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {isSearching ? (
            <div>
              <p className="text-center text-gray-500 mb-4">Searching items...</p>
              <ItemsLoadingSkeleton />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery ? `No items found for "${searchQuery}". Try a different search term.` : "No items found."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative"
                >
                  <Link href={`/items/${item.id}`} className="block">
                    <div className="aspect-square relative">
                      <Image
                        src={
                          item.image || `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(item.name)}`
                        }
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      />
                    </div>
                    <div className="p-4 pb-12">
                      <h3 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">From {formatPrice(item.lowestPrice)}</p>
                    </div>
                  </Link>
                  <div className="absolute bottom-4 right-4">
                    <AddToCartButton item={item} variant="quantity" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
