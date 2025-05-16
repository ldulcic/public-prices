"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Item } from "@/lib/types"

export interface CartItem extends Item {
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Item) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("groceryCart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("groceryCart", JSON.stringify(items))
  }, [items])

  const addItem = (item: Item) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id)
      if (existingItem) {
        // If item already exists, increase quantity
        return prevItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      } else {
        // Otherwise add new item with quantity 1
        return [...prevItems, { ...item, quantity: 1 }]
      }
    })
  }

  const removeItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }

    setItems((prevItems) => prevItems.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setItems([])
  }

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
