"use client"

import { ShoppingCart, Plus, Minus } from "lucide-react"
import { useState, useEffect } from "react"
import { useCart } from "@/lib/cart-context"
import type { Item } from "@/lib/types"

interface AddToCartButtonProps {
  item: Item
  variant?: "icon" | "full" | "quantity"
  className?: string
}

export function AddToCartButton({ item, variant = "full", className = "" }: AddToCartButtonProps) {
  const { addItem, updateQuantity, items } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(0)

  // Check if item is in cart and get its quantity
  useEffect(() => {
    const cartItem = items.find((i) => i.id === item.id)
    setQuantity(cartItem ? cartItem.quantity : 0)
  }, [items, item.id])

  const handleAddToCart = () => {
    setIsAdding(true)
    addItem(item)

    // Show feedback for a short time
    setTimeout(() => {
      setIsAdding(false)
    }, 500)
  }

  const handleIncreaseQuantity = () => {
    updateQuantity(item.id, quantity + 1)
  }

  const handleDecreaseQuantity = () => {
    if (quantity > 0) {
      updateQuantity(item.id, quantity - 1)
    }
  }

  // Quantity controls variant
  if (variant === "quantity") {
    if (quantity === 0) {
      return (
        <button
          onClick={handleAddToCart}
          className={`p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors ${className}`}
          aria-label="Add to cart"
        >
          <Plus className="h-4 w-4" />
        </button>
      )
    }

    return (
      <div className={`flex items-center border border-gray-300 rounded-md ${className}`}>
        <button
          onClick={handleDecreaseQuantity}
          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="px-3 py-1">{quantity}</span>
        <button
          onClick={handleIncreaseQuantity}
          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    )
  }

  // Icon-only variant
  if (variant === "icon") {
    return (
      <button
        onClick={handleAddToCart}
        className={`p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors ${className}`}
        aria-label="Add to cart"
      >
        {isAdding ? <Plus className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      </button>
    )
  }

  // Full button variant (default)
  return (
    <button
      onClick={handleAddToCart}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors ${className}`}
    >
      {isAdding ? (
        <>
          <Plus className="h-4 w-4" />
          <span>Added!</span>
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          <span>Add to Cart</span>
        </>
      )}
    </button>
  )
}
