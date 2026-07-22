import { useQuery } from '@tanstack/react-query'
import { fetchDocuments } from '@/api/admin'
import type { DocumentResponse } from '@/types'

const isActive = (doc: DocumentResponse) =>
  doc.status === 'PENDING' || doc.status === 'INGESTING'

export function useDocuments(subjectId: string) {
  return useQuery({
    queryKey: ['documents', subjectId],
    queryFn: () => fetchDocuments(subjectId),
    enabled: subjectId.length > 0,
    // Poll while anything is still ingesting; stop once every row is READY/FAILED.
    refetchInterval: (query) => (query.state.data?.some(isActive) ? 2500 : false),
  })
}
