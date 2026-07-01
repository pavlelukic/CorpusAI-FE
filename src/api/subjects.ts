import { apiFetch } from '@/lib/api'
import type { Subject } from '@/types'

export function fetchSubjects(): Promise<Subject[]> {
  return apiFetch<Subject[]>('/api/subjects')
}
