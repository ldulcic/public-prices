"use client"

import { useState } from "react"
import type { StorePrice } from "@/lib/types"

// Mock price history data
const generateMockPriceHistory = (currentPrice: number) => {
  const today = new Date()
  const data = []

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Generate a price that fluctuates around the current price
    const randomFactor = 0.9 + Math.random() * 0.2 // Between 0.9 and 1.1
    const price = Math.round(currentPrice * randomFactor * 100) / 100

    data.push({
      date: date.toISOString().split("T")[0],
      price,
    })
  }

  return data
}

export function PriceHistory({ storePrice }: { storePrice: StorePrice }) {
  const [showHistory, setShowHistory] = useState(false)
  const priceHistory = generateMockPriceHistory(storePrice.price)

  // Find min and max prices for scaling
  const minPrice = Math.min(...priceHistory.map((d) => d.price)) * 0.95
  const maxPrice = Math.max(...priceHistory.map((d) => d.price)) * 1.05
  const priceRange = maxPrice - minPrice

  // Chart dimensions
  const width = 600
  const height = 200
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Scale point positions
  const points = priceHistory.map((d, i) => {
    const x = padding.left + (i / (priceHistory.length - 1)) * chartWidth
    const y = padding.top + chartHeight - ((d.price - minPrice) / priceRange) * chartHeight
    return { x, y, ...d }
  })

  // Create SVG path
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

  const storeName = storePrice.store.charAt(0).toUpperCase() + storePrice.store.slice(1)

  return (
    <div className="mt-4">
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="text-sm text-green-600 hover:text-green-700 flex items-center"
      >
        {showHistory ? "Hide price history" : "Show price history"}
      </button>

      {showHistory && (
        <div className="mt-2 bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium mb-2">30-Day Price History at {storeName}</h4>
          <div className="overflow-x-auto">
            <svg width={width} height={height} className="mx-auto">
              {/* X-axis */}
              <line
                x1={padding.left}
                y1={padding.top + chartHeight}
                x2={padding.left + chartWidth}
                y2={padding.top + chartHeight}
                stroke="#e5e7eb"
              />

              {/* Y-axis */}
              <line
                x1={padding.left}
                y1={padding.top}
                x2={padding.left}
                y2={padding.top + chartHeight}
                stroke="#e5e7eb"
              />

              {/* Price line */}
              <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2" />

              {/* Data points */}
              {points.map((point, i) => (
                <circle key={i} cx={point.x} cy={point.y} r="3" fill="#10b981" />
              ))}

              {/* X-axis labels (show only a few dates) */}
              {[0, 10, 20, 30].map((i) => {
                if (i < priceHistory.length) {
                  const point = points[i]
                  return (
                    <text
                      key={i}
                      x={point.x}
                      y={padding.top + chartHeight + 15}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#6b7280"
                    >
                      {point.date.slice(5)} {/* Show only MM-DD */}
                    </text>
                  )
                }
                return null
              })}

              {/* Y-axis labels */}
              {[minPrice, (minPrice + maxPrice) / 2, maxPrice].map((price, i) => {
                const y = padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight
                return (
                  <text key={i} x={padding.left - 5} y={y + 3} textAnchor="end" fontSize="10" fill="#6b7280">
                    ${price.toFixed(2)}
                  </text>
                )
              })}
            </svg>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Note: This is simulated price history data for demonstration purposes.
          </p>
        </div>
      )}
    </div>
  )
}
