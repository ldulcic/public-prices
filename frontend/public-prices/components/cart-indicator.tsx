"use client"

import { ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"

export function CartIndicator() {
  const { getItemCount } = useCart()
  const itemCount = getItemCount()

  return (
    <Link href="/cart" className="relative flex items-center text-gray-600 hover:text-green-600 transition-colors">
      <ShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  )
}
