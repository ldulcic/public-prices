import { ItemDetails } from "@/components/item-details"
import { Suspense } from "react"
import { ItemDetailsLoadingSkeleton } from "@/components/loading-skeletons"
import { getItemDetails } from "@/lib/api"
import { notFound } from "next/navigation"
import { AlertCircle } from "lucide-react"

interface PageProps {
  params: {
    id: string
  }
}

export default async function ItemDetailsPage({ params }: PageProps) {
  const id = (await params).id

  try {
    console.log(`Fetching details for item ${id} in page component`)
    const itemDetails = await getItemDetails(id)
    console.log(`Successfully fetched details for item ${id}`)

    return (
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<ItemDetailsLoadingSkeleton />}>
          <ItemDetails itemDetails={itemDetails} />
        </Suspense>
      </main>
    )
  } catch (error) {
    console.error(`Error fetching item ${id}:`, error)

    // If it's a 404, use notFound
    if (error instanceof Error && error.message.includes("404")) {
      notFound()
    }

    // Otherwise show an error message
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Error Loading Item</h1>
          <p className="text-gray-600 mb-6">We encountered a problem while loading this item. The error was:</p>
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-left">
            <p className="text-red-700 font-mono text-sm">{error instanceof Error ? error.message : "Unknown error"}</p>
          </div>
          <a
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            Return to Home
          </a>
        </div>
      </main>
    )
  }
}
