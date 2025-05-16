"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, Loader2 } from "lucide-react"
import Image from "next/image"
import { getItems } from "@/lib/api"
import type { Item } from "@/lib/types"
import { formatPrice } from "@/lib/utils"

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading?: boolean
}

export function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Item[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [allItems, setAllItems] = useState<Item[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Fetch all items on component mount for suggestions
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoadingSuggestions(true)
        const items = await getItems()
        setAllItems(items)
      } catch (error) {
        console.error("Failed to fetch items for autocomplete:", error)
      } finally {
        setIsLoadingSuggestions(false)
      }
    }

    fetchItems()
  }, [])

  // Filter suggestions based on query
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    setIsLoadingSuggestions(true)
    const lowerQuery = query.toLowerCase()

    // Filter items that match the query
    const filteredItems = allItems.filter((item) => item.name.toLowerCase().includes(lowerQuery)).slice(0, 5) // Limit to 5 suggestions

    setSuggestions(filteredItems)
    setIsLoadingSuggestions(false)
    setShowSuggestions(true)
    setHighlightedIndex(-1)
  }, [query, allItems])

  // Handle debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, onSearch])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
          break
        case "ArrowUp":
          e.preventDefault()
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break
        case "Enter":
          e.preventDefault()
          if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
            const selectedItem = suggestions[highlightedIndex]
            setQuery(selectedItem.name)
            setShowSuggestions(false)
            onSearch(selectedItem.name)
          }
          break
        case "Escape":
          setShowSuggestions(false)
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [showSuggestions, suggestions, highlightedIndex, onSearch])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={suggestionsRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setShowSuggestions(true)}
          placeholder="Search for items..."
          className="w-full px-4 py-2 pl-10 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        {(isLoading || isLoadingSuggestions) && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 animate-spin" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
          {suggestions.map((item, index) => (
            <button
              key={item.id}
              onClick={() => {
                setQuery(item.name)
                setShowSuggestions(false)
                onSearch(item.name)
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-3 ${
                index === highlightedIndex ? "bg-gray-100" : ""
              }`}
            >
              <div className="w-8 h-8 relative flex-shrink-0">
                <Image
                  src={item.image || `/placeholder.svg?height=32&width=32&text=${encodeURIComponent(item.name)}`}
                  alt=""
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div>
                <div className="font-medium text-gray-900">{item.name}</div>
                <div className="text-sm text-gray-500">From {formatPrice(item.lowestPrice)}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
