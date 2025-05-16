import { CartPage } from "@/components/cart-page"

export default function Cart() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Your Shopping Cart</h1>
      <CartPage />
    </main>
  )
}
