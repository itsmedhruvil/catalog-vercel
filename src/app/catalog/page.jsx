import CatalogClient from '@/components/CatalogClient'

export default async function CatalogPage({ searchParams }) {
  const resolvedSearchParams = await searchParams
  const sharedIds = resolvedSearchParams?.shared
    ? resolvedSearchParams.shared.split(',').filter(Boolean)
    : []
  const filterParam = resolvedSearchParams?.filter || 'all'

  return <CatalogClient initialSharedIds={sharedIds} initialFilter={filterParam} />
}
