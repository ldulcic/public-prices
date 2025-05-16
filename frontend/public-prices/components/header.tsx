import Link from "next/link"
import { ShoppingBasket } from "lucide-react"
import { CartIndicator } from "./cart-indicator"

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <ShoppingBasket className="h-6 w-6 text-green-600" />
          <span>GroceryCompare</span>
        </Link>
        <nav className="flex items-center gap-6">
          <ul className="flex gap-6">
            <li>
              <Link href="/" className="text-gray-600 hover:text-green-600 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-gray-600 hover:text-green-600 transition-colors">
                About
              </Link>
            </li>
          </ul>
          <CartIndicator />
        </nav>
      </div>
    </header>
  )
}
