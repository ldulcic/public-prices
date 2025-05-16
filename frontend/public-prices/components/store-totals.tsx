"use client"

import { useState, useEffect } from "react"
import type { ItemWithPrices } from "@/lib/types"
import type { CartItem } from "@/lib/cart-context"
import { Check, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { getItemDetails } from "@/lib/api"
import { formatPrice } from "@/lib/utils"

interface StoreTotalsProps {
  cartItems: CartItem[]
  itemDetails: Record<string, ItemWithPrices>
}

interface StoreTotal {
  store: string
  location: string
  total: number
  isCheapest: boolean
  missingItems: { id: string | number; name: string }[]
  hasAllItems: boolean
}

export function StoreTotals({ cartItems, itemDetails }: StoreTotalsProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [expandedStore, setExpandedStore] = useState<string | null>(null)

  // Calculate totals for each store
  const calculateStoreTotals = (): StoreTotal[] => {
    // Get all unique stores from all items
    const storeSet = new Set<string>()

    // Collect all stores from all items
    Object.values(itemDetails).forEach((item) => {
      item.prices.forEach((price) => {
        storeSet.add(price.store)
      })
    })

    if (storeSet.size === 0) return []

    const storeTotals: Record<string, StoreTotal> = {}

    // Initialize store totals
    Array.from(storeSet).forEach((store) => {
      storeTotals[store] = {
        store,
        location: `${store.charAt(0).toUpperCase() + store.slice(1)} Store`,
        total: 0,
        isCheapest: false,
        missingItems: [],
        hasAllItems: true,
      }
    })

    // Calculate total for each store and track missing items
    cartItems.forEach((item) => {
      const detail = itemDetails[item.id]
      if (!detail) return

      // Check which stores have this item
      const storesWithItem = new Set(detail.prices.map(price => price.store))
      
      // Add to missing items for stores that don't have it
      Object.keys(storeTotals).forEach(store => {
        if (!storesWithItem.has(store)) {
          storeTotals[store].missingItems.push({
            id: item.id,
            name: item.name
          })
          storeTotals[store].hasAllItems = false
        }
      })

      // Add to total for stores that have it
      detail.prices.forEach((price) => {
        if (storeTotals[price.store]) {
          storeTotals[price.store].total += price.price * item.quantity
        }
      })
    })

    // Convert to array and sort by total price
    const totalsArray = Object.values(storeTotals).sort((a, b) => a.total - b.total)

    // Find the cheapest store with all items
    const cheapestStoreWithAllItems = totalsArray.find(store => store.hasAllItems)

    // Mark the cheapest store
    if (totalsArray.length > 0) {
      totalsArray[0].isCheapest = true
    }

    // If the cheapest store with all items is also the cheapest overall, don't mark any store as blue
    if (cheapestStoreWithAllItems && cheapestStoreWithAllItems.isCheapest) {
      cheapestStoreWithAllItems.hasAllItems = false
    }

    return totalsArray
  }

  const storeTotals = calculateStoreTotals()

  if (storeTotals.length === 0) {
    return null
  }

  return (
    <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <h3 className="text-lg font-medium">Store Totals</h3>
        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      {isExpanded && (
        <div className="p-4">
          <div className="space-y-4">
            {storeTotals.map((store) => (
              <div
                key={store.store}
                className={`flex flex-col p-4 rounded-lg ${
                  store.isCheapest
                    ? "bg-green-50 border border-green-200"
                    : store.hasAllItems
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {store.isCheapest ? (
                      <div className="bg-green-600 text-white p-1 rounded-full mr-3">
                        <Check className="h-4 w-4" />
                      </div>
                    ) : store.hasAllItems && (
                      <div className="bg-blue-600 text-white p-1 rounded-full mr-3">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium">{store.store.charAt(0).toUpperCase() + store.store.slice(1)}</h4>
                      <p className="text-sm text-gray-500">{store.location}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-sm text-gray-600 mb-1">
                      Price for {cartItems.length - store.missingItems.length} of {cartItems.length} items
                    </div>
                    <span className="text-xl font-bold">{formatPrice(store.total)}</span>
                    {store.isCheapest && <span className="text-sm text-green-600">Best Value</span>}
                    {!store.isCheapest && store.hasAllItems && <span className="text-sm text-blue-600">All Items Available</span>}
                    {store.missingItems.length > 0 && (
                      <span className="text-sm text-red-600">
                        {store.missingItems.length} item{store.missingItems.length !== 1 ? 's' : ''} missing
                      </span>
                    )}
                  </div>
                </div>

                {store.missingItems.length > 0 && (
                  <div className="mt-3">
                    <button
                      onClick={() => setExpandedStore(expandedStore === store.store ? null : store.store)}
                      className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      {expandedStore === store.store ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      Show missing items
                    </button>
                    
                    {expandedStore === store.store && (
                      <div className="mt-2 pl-4 border-l-2 border-gray-200">
                        <ul className="space-y-1">
                          {store.missingItems.map((item) => (
                            <li key={item.id} className="text-sm text-gray-600">
                              {item.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            * Totals are calculated based on the current items in your cart and their quantities.
          </p>
        </div>
      )}
    </div>
  )
}
