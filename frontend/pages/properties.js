import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { FaArrowLeft } from 'react-icons/fa'

export default function PropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(false)

  return (
    <>
      <Head>
        <title>All Properties - LuxeProperty</title>
        <meta name="description" content="Browse all available luxury properties" />
      </Head>

      <main className="pt-32 pb-16 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-secondary hover:text-primary mb-8 font-semibold"
          >
            <FaArrowLeft /> Back
          </button>

          <h1 className="font-display text-5xl font-bold text-primary mb-4">
            All Properties
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Explore our complete collection of luxury properties
          </p>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-pulse text-gray-600">Loading properties...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Properties will be loaded here */}
              <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                No properties found. Check back soon!
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
