import { useQuery } from '@tanstack/react-query'
import { fetchSubjects } from '@/api/subjects'

export function useSubjects() {
  const { data: subjects, isLoading, error } = useQuery({
    queryKey: ['subjects'],
    queryFn: fetchSubjects,
  })

  return { subjects, isLoading, error }
}
