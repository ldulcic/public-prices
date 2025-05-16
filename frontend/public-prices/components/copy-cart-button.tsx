"use client"

import { useState } from "react"
import { Clipboard, Check } from "lucide-react"
import type { ItemWithPrices } from "@/lib/types"
import type { CartItem } from "@/lib/cart-context"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/utils"

interface CopyCartButtonProps {
  cartItems: CartItem[]
  itemDetails: Record<string, ItemWithPrices>
}

export function CopyCartButton({ cartItems, itemDetails }: CopyCartButtonProps) {
  const [copied, setCopied] = useState(false)
  const cart = useCart()

  const formatCartForClipboard = () => {
    const items = cart.items.map((item) => {
      const storePrice = itemDetails[item.id]?.prices[0]
      return `  - ${item.name}, ${item.quantity}, ${formatPrice(storePrice?.price || 0)}`
    })

    return `Shopping List:\n${items.join("\n")}`
  }

  const handleCopyToClipboard = async () => {
    const formattedContent = formatCartForClipboard()

    try {
      await navigator.clipboard.writeText(formattedContent)
      setCopied(true)

      // Reset the copied state after 1.5 seconds
      setTimeout(() => {
        setCopied(false)
      }, 1500)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  return (
    <button
      onClick={handleCopyToClipboard}
      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
        copied ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
      disabled={copied}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Clipboard className="h-4 w-4" />
          <span>Copy Shopping List</span>
        </>
      )}
    </button>
  )
}
