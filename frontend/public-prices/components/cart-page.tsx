"use client"

import { useCart } from "@/lib/cart-context"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { getItemDetails } from "@/lib/api"
import type { ItemWithPrices } from "@/lib/types"
import { formatPrice } from "@/lib/utils"

// Import the components
import { StoreTotals } from "./store-totals"
import { CopyCartButton } from "./copy-cart-button"

export function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart()
  const [itemDetails, setItemDetails] = useState<Record<string, ItemWithPrices>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchItemDetails = async () => {
      if (items.length === 0) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const details: Record<string, ItemWithPrices> = {}

      // Fetch details for all items in parallel
      await Promise.all(
        items.map(async (item) => {
          try {
            const itemDetail = await getItemDetails(item.id.toString())
            details[item.id] = itemDetail
          } catch (error) {
            console.error(`Failed to fetch details for item ${item.id}:`, error)
          }
        }),
      )

      setItemDetails(details)
      setIsLoading(false)
    }

    fetchItemDetails()
  }, [items])

  // Get the cheapest price and store for an item
  const getCheapestPriceInfo = (itemId: string | number) => {
    const detail = itemDetails[itemId]
    if (!detail || !detail.prices || detail.prices.length === 0) {
      return { price: 0, store: "Unknown" }
    }

    const cheapestPrice = [...detail.prices].sort((a, b) => a.price - b.price)[0]
    return {
      price: cheapestPrice.price,
      store: cheapestPrice.store.charAt(0).toUpperCase() + cheapestPrice.store.slice(1), // Capitalize first letter
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some items to your cart to see them here.</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Items in Your Cart</h2>
            <div className="flex gap-3">
              {!isLoading && Object.keys(itemDetails).length > 0 && (
                <CopyCartButton cartItems={items} itemDetails={itemDetails} />
              )}
              <button onClick={clearCart} className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1">
                <Trash2 className="h-4 w-4" />
                Clear Cart
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">Loading cart items...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => {
                const { price, store } = getCheapestPriceInfo(item.id)
                const itemDetail = itemDetails[item.id]

                return (
                  <div key={item.id} className="flex flex-col border-b border-gray-200 pb-6">
                    <div className="flex items-center">
                      <div className="w-20 h-20 relative flex-shrink-0">
                        <Image
                          src={
                            item.image || `/placeholder.svg?height=80&width=80&text=${encodeURIComponent(item.name)}`
                          }
                          alt={item.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>

                      <div className="ml-4 flex-grow">
                        <Link href={`/items/${item.id}`} className="font-medium text-gray-900 hover:text-green-600">
                          {item.name}
                        </Link>
                        <div className="text-sm text-gray-500 mt-1">
                          Best price: {formatPrice(price)} at {store}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 py-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {itemDetail && (
                      <div className="mt-3 ml-24">
                        <div className="text-sm font-medium mb-1">All store prices:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {itemDetail.prices.map((storePrice) => (
                            <div
                              key={storePrice.store}
                              className={`text-sm px-2 py-1 rounded ${
                                storePrice.price === price ? "bg-green-100 text-green-800" : "bg-gray-100"
                              }`}
                            >
                              {storePrice.store.charAt(0).toUpperCase() + storePrice.store.slice(1)}: {formatPrice(storePrice.price)} × {item.quantity} = {formatPrice(storePrice.price * item.quantity)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            {!isLoading && Object.keys(itemDetails).length > 0 && (
              <StoreTotals cartItems={items} itemDetails={itemDetails} />
            )}

            <div className="mt-6 text-sm text-gray-500 mb-4">
              Note: Items are from different stores. The best price for each item is shown.
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
