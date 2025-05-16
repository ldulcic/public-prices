"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { useState } from "react"
import type { ItemWithPrices, StorePrice } from "@/lib/types"
import { StoreFilter } from "./store-filter"
import { PriceHistory } from "./price-history"
import { AddToCartButton } from "./add-to-cart-button"
import { formatPrice } from "@/lib/utils"

export function ItemDetails({ itemDetails }: { itemDetails: ItemWithPrices }) {
  const [displayedPrices, setDisplayedPrices] = useState<StorePrice[]>(
    // Sort prices by default (lowest first)
    [...itemDetails.prices].sort((a, b) => a.price - b.price),
  )

  const handleFilterChange = (filteredPrices: StorePrice[]) => {
    // Always sort by price
    setDisplayedPrices([...filteredPrices].sort((a, b) => a.price - b.price))
  }

  // Create an item object for the cart
  const cartItem = {
    id: itemDetails.id,
    name: itemDetails.name,
    image: itemDetails.image,
    lowestPrice: displayedPrices.length > 0 ? displayedPrices[0].price : 0,
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to search
      </Link>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0 md:w-1/3">
            <div className="relative h-64 md:h-full">
              <Image
                src={
                  itemDetails.image ||
                  `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(itemDetails.name)}`
                }
                alt={itemDetails.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="p-6 md:p-8 md:w-2/3">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{itemDetails.name}</h1>
              <AddToCartButton item={cartItem} variant="quantity" />
            </div>
            <p className="text-gray-600 mb-6">
              {itemDetails.description || `Available at ${itemDetails.prices.length} stores`}
            </p>

            <StoreFilter prices={itemDetails.prices} onFilterChange={handleFilterChange} />

            <h2 className="text-xl font-semibold mb-4">Price Comparison</h2>
            {displayedPrices.length > 0 ? (
              <div className="space-y-4">
                {displayedPrices.map((storePrice, index) => (
                  <div
                    key={storePrice.store}
                    className={`flex items-center justify-between p-4 rounded-lg border ${index === 0 ? "border-green-500 bg-green-50" : "border-gray-200"}`}
                  >
                    <div className="flex items-center">
                      {index === 0 && (
                        <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded mr-3">
                          BEST PRICE
                        </span>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{storePrice.store}</h3>
                        <p className="text-sm text-gray-500">{storePrice.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold">{formatPrice(storePrice.price)}</span>
                      {storePrice.url && (
                        <Link
                          href={storePrice.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </Link>
                      )}
                      <PriceHistory storePrice={storePrice} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No stores match your filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
