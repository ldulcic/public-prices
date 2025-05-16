import { ItemList } from "@/components/item-list"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Grocery Price Comparison</h1>
      <ItemList />
    </main>
  )
}
