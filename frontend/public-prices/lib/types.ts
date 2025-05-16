export interface Item {
  id: string | number
  name: string
  image?: string
  lowestPrice: number
}

// Store price information
export interface StorePrice {
  price: number
  store: string
  location?: string
  url?: string
}

// Detailed item information with prices from different stores
export interface ItemWithPrices {
  id: string | number
  name: string
  description?: string
  image?: string
  prices: StorePrice[]
}

// API response types that match your actual API
export interface ApiItem {
  id: number
  name: string
  prices: {
    price: number
    store: string
  }[]
}

export interface ApiItemDetails {
  id: number
  name: string
  prices: {
    price: number
    store: string
  }[]
}
