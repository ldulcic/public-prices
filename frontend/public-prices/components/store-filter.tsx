"use client"

import { useState } from "react"
import type { StorePrice } from "@/lib/types"

export function StoreFilter({
  prices,
  onFilterChange,
}: {
  prices: StorePrice[]
  onFilterChange: (filteredPrices: StorePrice[]) => void
}) {
  const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set())

  // Get unique stores
  const stores = Array.from(new Set(prices.map((price) => price.store)))

  const handleStoreToggle = (store: string) => {
    const newSelectedStores = new Set(selectedStores)

    if (newSelectedStores.has(store)) {
      newSelectedStores.delete(store)
    } else {
      newSelectedStores.add(store)
    }

    setSelectedStores(newSelectedStores)

    // If no stores are selected, show all prices
    if (newSelectedStores.size === 0) {
      onFilterChange(prices)
    } else {
      // Otherwise, filter prices by selected stores
      const filteredPrices = prices.filter((price) => newSelectedStores.has(price.store))
      onFilterChange(filteredPrices)
    }
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Filter by Store</h3>
      <div className="flex flex-wrap gap-2">
        {stores.map((store) => (
          <button
            key={store}
            onClick={() => handleStoreToggle(store)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedStores.has(store) ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {store.charAt(0).toUpperCase() + store.slice(1)}
          </button>
        ))}
        {selectedStores.size > 0 && (
          <button
            onClick={() => {
              setSelectedStores(new Set())
              onFilterChange(prices)
            }}
            className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  )
}
