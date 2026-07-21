import { useQuery } from '@tanstack/react-query'
import { fetchAdminSubjects } from '@/api/admin'

export function useAdminSubjects() {
  return useQuery({
    queryKey: ['admin-subjects'],
    queryFn: fetchAdminSubjects,
  })
}