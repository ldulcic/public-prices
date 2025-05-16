import type { Item, ItemWithPrices, ApiItem, ApiItemDetails } from "./types"
import { API_CONFIG } from "./config"

// Helper function to handle API errors with more details
const handleApiError = (error: unknown, message: string) => {
  if (error instanceof Error) {
    console.error(`API Error: ${message}`, error.message)
  } else {
    console.error(`API Error: ${message}`, error)
  }
  throw new Error(`${message}: ${error instanceof Error ? error.message : "Unknown error"}`)
}

// Custom fetch with timeout and retry
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000, retries = 2) => {
  // Create an abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  options.signal = controller.signal

  try {
    console.log(`Fetching: ${url}`)
    const response = await fetch(url, options)
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}, URL: ${url}`)
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)

    // If we have retries left and it's a timeout error, retry
    if (retries > 0 && error instanceof Error && error.name === "AbortError") {
      console.log(`Request timed out, retrying... (${retries} retries left)`)
      return fetchWithTimeout(url, options, timeout, retries - 1)
    }

    throw error
  }
}

// Helper function to capitalize first letter of each word
const capitalizeWords = (str: string): string => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Transform API item to our internal Item format
const transformApiItem = (apiItem: ApiItem): Item => {
  // Find the lowest price
  const lowestPrice = apiItem.prices.length > 0 ? Math.min(...apiItem.prices.map((p) => p.price)) : 0

  return {
    id: apiItem.id.toString(),
    name: capitalizeWords(apiItem.name),
    // No image in API, use placeholder
    image: `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(apiItem.name)}`,
    lowestPrice,
  }
}

// Transform API item details to our internal ItemWithPrices format
const transformApiItemDetails = (apiItemDetails: ApiItemDetails): ItemWithPrices => {
  // Transform prices to include more information
  const transformedPrices = apiItemDetails.prices.map((p) => ({
    price: p.price,
    store: capitalizeWords(p.store),
    // Add location and URL (these aren't in the API, so we're adding defaults)
    location: `${capitalizeWords(p.store)} Store`,
    url: "#",
  }))

  return {
    id: apiItemDetails.id.toString(),
    name: capitalizeWords(apiItemDetails.name),
    // Add a generic description since it's not in the API
    description: `${capitalizeWords(apiItemDetails.name)} - Available at ${apiItemDetails.prices.length} stores`,
    // No image in API, use placeholder
    image: `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(apiItemDetails.name)}`,
    prices: transformedPrices,
  }
}

// Get all items
export async function getItems(searchQuery?: string): Promise<Item[]> {
  try {
    console.log("Fetching items from API...")
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseUrl}/items`,
      {
        headers: {
          Accept: "application/json",
        },
      },
      15000,
    ) // 15 second timeout

    console.log("Items API response received")
    const apiItems: ApiItem[] = await response.json()
    console.log(`Received ${apiItems.length} items from API`)

    // Transform API items to our internal format
    let items = apiItems.map(transformApiItem)

    // Filter by search query if provided
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      items = items.filter((item) => item.name.toLowerCase().includes(query))
    }

    return items
  } catch (error) {
    handleApiError(error, "Failed to fetch items")
    return [] // Return empty array as fallback
  }
}

// Get details for a specific item
export async function getItemDetails(id: string): Promise<ItemWithPrices> {
  try {
    console.log(`Fetching details for item ${id}...`)
    const response = await fetchWithTimeout(
      `${API_CONFIG.baseUrl}/prices/${id}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
      15000,
    ) // 15 second timeout

    console.log(`Item ${id} details received`)
    const apiItemDetails: ApiItemDetails = await response.json()

    // Transform API item details to our internal format
    return transformApiItemDetails(apiItemDetails)
  } catch (error) {
    handleApiError(error, `Failed to fetch details for item ${id}`)
    throw error
  }
}
