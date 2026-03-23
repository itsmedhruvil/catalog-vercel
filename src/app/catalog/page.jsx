import CatalogClient from '@/components/CatalogClient'

export default function CatalogPage({ searchParams }) {
  const sharedIds = searchParams?.shared
    ? searchParams.shared.split(',').filter(Boolean)
    : []
  const filterParam = searchParams?.filter || 'all'

  return <CatalogClient initialSharedIds={sharedIds} initialFilter={filterParam} />
}
