import Link from "next/link"
import { ShoppingCart } from "lucide-react"

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">About GroceryCompare</h1>

        <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-6">
            GroceryCompare helps you save money by comparing grocery prices across multiple stores. We gather public
            price information from different retailers so you can make informed decisions about where to shop.
          </p>

          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full p-2 mr-4 mt-1">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-medium text-lg">Compare Prices</h3>
                <p className="text-gray-600">
                  Browse our database of products and see real-time prices from multiple grocery stores in one place.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-green-100 rounded-full p-2 mr-4 mt-1">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-medium text-lg">Build Your Shopping Cart</h3>
                <p className="text-gray-600">
                  Add items to your cart and see which store offers the best overall price for your entire shopping
                  list.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-green-100 rounded-full p-2 mr-4 mt-1">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-medium text-lg">Save Money</h3>
                <p className="text-gray-600">
                  Make informed decisions about where to shop to maximize your savings on groceries.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Benefits</h2>
          <ul className="list-disc pl-6 mb-8 space-y-2 text-gray-700">
            <li>Compare prices across multiple stores in seconds</li>
            <li>Find the cheapest store for your entire shopping list</li>
            <li>Track price history to identify the best time to buy</li>
            <li>Create and share shopping lists with family and friends</li>
            <li>Save money on your grocery shopping every week</li>
          </ul>

          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors text-lg font-medium"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Start Shopping</span>
            </Link>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-3">Data Sources</h2>
          <p className="text-gray-600 text-sm">
            GroceryCompare collects publicly available price information from grocery store websites and other public
            sources. We strive to keep our data accurate and up-to-date, but prices may occasionally differ from
            in-store prices. Always verify the final price at checkout.
          </p>
        </div>
      </div>
    </main>
  )
}