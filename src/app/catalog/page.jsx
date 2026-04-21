import CatalogClient from '@/components/CatalogClient'
import { readProducts } from '@/lib/db'

export default async function CatalogPage({ searchParams }) {
  const resolvedSearchParams = await searchParams
  const sharedIds = resolvedSearchParams?.shared
    ? resolvedSearchParams.shared.split(',').filter(Boolean)
    : []
  const filterParam = resolvedSearchParams?.filter || 'all'

  const initialProducts = await readProducts()

  return <CatalogClient initialSharedIds={sharedIds} initialFilter={filterParam} initialProducts={initialProducts} />
}
