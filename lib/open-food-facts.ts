export interface OpenFoodFactsProduct {
  code: string
  product_name: string
  brands?: string
  quantity?: string
  image_url?: string
  nutriments?: {
    [key: string]: number
  }
}

export interface OpenFoodFactsSearchResponse {
  products: OpenFoodFactsProduct[]
  count: number
  page: number
  page_size: number
}

export async function searchProducts(query: string, pageSize = 20): Promise<OpenFoodFactsProduct[]> {
  if (!query || query.length < 2) {
    return []
  }

  try {
    const searchStrategies = [
      // Strategy 1: Exact phrase search
      `https://br.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        query,
      )}&json=1&page_size=${pageSize}&fields=code,product_name,brands,quantity,image_url&search_simple=1&action=process`,

      // Strategy 2: Search with wildcard for partial matches
      `https://br.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        query + "*",
      )}&json=1&page_size=${pageSize}&fields=code,product_name,brands,quantity,image_url&search_simple=1&action=process`,
    ]

    const responses = await Promise.all(
      searchStrategies.map((url) =>
        fetch(url)
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null),
      ),
    )

    const allProducts = new Map<string, OpenFoodFactsProduct>()

    for (const data of responses) {
      if (data && data.products) {
        for (const product of data.products) {
          if (product.product_name && product.product_name.trim()) {
            const searchLower = query.toLowerCase()
            const nameLower = product.product_name.toLowerCase()
            const brandLower = (product.brands || "").toLowerCase()

            if (nameLower.includes(searchLower) || brandLower.includes(searchLower)) {
              if (!allProducts.has(product.code)) {
                allProducts.set(product.code, product)
              }
            }
          }
        }
      }
    }

    const results = Array.from(allProducts.values())

    const searchLower = query.toLowerCase()
    results.sort((a, b) => {
      const aName = a.product_name.toLowerCase()
      const bName = b.product_name.toLowerCase()
      const aBrand = (a.brands || "").toLowerCase()
      const bBrand = (b.brands || "").toLowerCase()

      // Exact match in name
      if (aName === searchLower && bName !== searchLower) return -1
      if (bName === searchLower && aName !== searchLower) return 1

      // Starts with in name
      if (aName.startsWith(searchLower) && !bName.startsWith(searchLower)) return -1
      if (bName.startsWith(searchLower) && !aName.startsWith(searchLower)) return 1

      // Contains in name (earlier position)
      const aIndex = aName.indexOf(searchLower)
      const bIndex = bName.indexOf(searchLower)
      if (aIndex !== -1 && bIndex !== -1 && aIndex !== bIndex) return aIndex - bIndex

      // Brand matches
      if (aBrand.includes(searchLower) && !bBrand.includes(searchLower)) return -1
      if (bBrand.includes(searchLower) && !aBrand.includes(searchLower)) return 1

      return 0
    })

    return results.slice(0, pageSize)
  } catch (error) {
    console.error("[v0] Error fetching products from Open Food Facts:", error)
    return []
  }
}

export async function getProductByBarcode(barcode: string): Promise<OpenFoodFactsProduct | null> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (data.status === 1 && data.product) {
      return {
        code: data.product.code || barcode,
        product_name: data.product.product_name || "",
        brands: data.product.brands,
        quantity: data.product.quantity,
        image_url: data.product.image_url,
        nutriments: data.product.nutriments,
      }
    }

    return null
  } catch (error) {
    console.error("[v0] Error fetching product by barcode:", error)
    return null
  }
}
