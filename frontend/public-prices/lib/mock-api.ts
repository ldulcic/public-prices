import type { Item, ItemWithPrices } from "./types"

// Mock data for development
const mockItems: Item[] = [
  {
    id: "1",
    name: "Bananas",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop",
    lowestPrice: 0.59,
  },
  {
    id: "2",
    name: "Apples",
    image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=400&fit=crop",
    lowestPrice: 1.29,
  },
  {
    id: "3",
    name: "Milk",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
    lowestPrice: 2.99,
  },
  {
    id: "4",
    name: "Bread",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop",
    lowestPrice: 2.49,
  },
  {
    id: "5",
    name: "Eggs",
    image: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400&h=400&fit=crop",
    lowestPrice: 3.49,
  },
  {
    id: "6",
    name: "Chicken Breast",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop",
    lowestPrice: 5.99,
  },
  {
    id: "7",
    name: "Ground Beef",
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=400&fit=crop",
    lowestPrice: 4.99,
  },
  {
    id: "8",
    name: "Pasta",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=400&fit=crop",
    lowestPrice: 1.49,
  },
  {
    id: "9",
    name: "Rice",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop",
    lowestPrice: 2.19,
  },
  {
    id: "10",
    name: "Cereal",
    image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=400&fit=crop",
    lowestPrice: 3.99,
  },
  {
    id: "11",
    name: "Orange Juice",
    image: "https://images.unsplash.com/photo-1613478223719-60547544c04?w=400&h=400&fit=crop",
    lowestPrice: 3.29,
  },
  {
    id: "12",
    name: "Yogurt",
    image: "https://images.unsplash.com/photo-1488477181946-6428a848b8e0?w=400&h=400&fit=crop",
    lowestPrice: 1.79,
  },
]

// Ensure we have consistent store IDs and names across all items
const stores = [
  { id: "store1", name: "SuperMart", location: "Downtown" },
  { id: "store2", name: "FreshGrocer", location: "Westside" },
  { id: "store3", name: "ValueMart", location: "Eastside" },
  { id: "store4", name: "OrganicMarket", location: "Northside" },
]

// Update the mock data generation to ensure all items are in all stores
// This function will be used when creating mockItemDetails
const generateConsistentPrices = (basePrice: number) => {
  return stores.map((store) => {
    // Generate a price that varies slightly by store
    let price
    if (store.id === "store3") {
      // ValueMart is usually cheapest
      price = basePrice * 0.95
    } else if (store.id === "store4") {
      // OrganicMarket is usually most expensive
      price = basePrice * 1.25
    } else if (store.id === "store1") {
      // SuperMart is middle range
      price = basePrice * 1.05
    } else {
      // FreshGrocer
      price = basePrice * 1.1
    }

    // Round to 2 decimal places
    price = Math.round(price * 100) / 100

    return {
      storeId: store.id,
      storeName: store.name,
      location: store.location,
      price: price,
      url: "#",
    }
  })
}

// Update each item in mockItemDetails to use our consistent store pricing
const mockItemDetails: Record<string, ItemWithPrices> = {
  "1": {
    id: "1",
    name: "Bananas",
    description: "Fresh, ripe bananas. Sold by the pound.",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&h=800&fit=crop",
    prices: generateConsistentPrices(0.59),
  },
  "2": {
    id: "2",
    name: "Apples",
    description: "Fresh, crisp apples. Sold by the pound.",
    image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&h=800&fit=crop",
    prices: generateConsistentPrices(1.29),
  },
  "3": {
    id: "3",
    name: "Milk",
    description: "Fresh whole milk. 1 gallon.",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&h=800&fit=crop",
    prices: generateConsistentPrices(2.99),
  },
  "4": {
    id: "4",
    name: "Bread",
    description: "Freshly baked white bread. 1 loaf.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=800&fit=crop",
    prices: generateConsistentPrices(2.49),
  },
  "5": {
    id: "5",
    name: "Eggs",
    description: "Farm fresh eggs. 1 dozen.",
    image: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=800&h=800&fit=crop",
    prices: generateConsistentPrices(3.49),
  },
  "6": {
    id: "6",
    name: "Chicken Breast",
    description: "Boneless, skinless chicken breast. Price per pound.",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=800&fit=crop",
    prices: generateConsistentPrices(5.99),
  },
  "7": {
    id: "7",
    name: "Ground Beef",
    description: "80% lean ground beef. Price per pound.",
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=800&fit=crop",
    prices: generateConsistentPrices(4.99),
  },
  "8": {
    id: "8",
    name: "Pasta",
    description: "Spaghetti pasta. 16 oz package.",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&h=800&fit=crop",
    prices: generateConsistentPrices(1.49),
  },
  "9": {
    id: "9",
    name: "Rice",
    description: "Long grain white rice. 2 lb bag.",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=800&fit=crop",
    prices: generateConsistentPrices(2.19),
  },
  "10": {
    id: "10",
    name: "Cereal",
    description: "Breakfast cereal. 18 oz box.",
    image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&h=800&fit=crop",
    prices: generateConsistentPrices(3.99),
  },
  "11": {
    id: "11",
    name: "Orange Juice",
    description: "100% pure orange juice. 64 oz bottle.",
    image: "https://images.unsplash.com/photo-1613478223719-60547544c04?w=800&h=800&fit=crop",
    prices: generateConsistentPrices(3.29),
  },
  "12": {
    id: "12",
    name: "Yogurt",
    description: "Plain yogurt. 32 oz container.",
    image: "https://images.unsplash.com/photo-1488477181946-6428a848b8e0?w=800&h=800&fit=crop",
    prices: generateConsistentPrices(1.79),
  },
}

// Mock API functions
export async function getMockItems(): Promise<Item[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return all items (no filtering)
  return mockItems
}

export async function getMockItemDetails(id: string): Promise<ItemWithPrices> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 700))

  const item = mockItemDetails[id]
  if (!item) {
    throw new Error(`Item with ID ${id} not found`)
  }

  return item
}
