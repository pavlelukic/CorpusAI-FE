import { API_BASE_URL, apiFetch, clearAuthAndRedirect } from '@/lib/api'
import { getToken } from '@/lib/auth'
import type {
  AdminSubject,
  AdminUser,
  ApiError,
  DocumentResponse,
  MetricsParams,
  MetricsResponse,
  SubjectRequest,
} from '@/types'

// Users & access grants

export function fetchAdminUsers(): Promise<AdminUser[]> {
  return apiFetch<AdminUser[]>('/api/admin/users')
}

export function grantAccess(userId: string, subjectId: string): Promise<void> {
  return apiFetch<void>(`/api/admin/users/${userId}/subjects/${subjectId}`, { method: 'POST' })
}

export function revokeAccess(userId: string, subjectId: string): Promise<void> {
  return apiFetch<void>(`/api/admin/users/${userId}/subjects/${subjectId}`, { method: 'DELETE' })
}

// Subjects

export function fetchAdminSubjects(): Promise<AdminSubject[]> {
  return apiFetch<AdminSubject[]>('/api/admin/subjects')
}

export function createSubject(body: SubjectRequest): Promise<AdminSubject> {
  return apiFetch<AdminSubject>('/api/admin/subjects', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateSubject(subjectId: string, body: SubjectRequest): Promise<AdminSubject> {
  return apiFetch<AdminSubject>(`/api/admin/subjects/${subjectId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function archiveSubject(subjectId: string): Promise<void> {
  return apiFetch<void>(`/api/admin/subjects/${subjectId}`, { method: 'DELETE' })
}

// Documents

export function fetchDocuments(subjectId: string): Promise<DocumentResponse[]> {
  return apiFetch<DocumentResponse[]>(`/api/admin/subjects/${subjectId}/documents`)
}

export function uploadDocument(subjectId: string, file: File): Promise<DocumentResponse> {
  const form = new FormData()
  form.append('file', file)
  return apiFetch<DocumentResponse>(`/api/admin/subjects/${subjectId}/documents`, {
    method: 'POST',
    body: form,
  })
}

export function deleteDocument(documentId: string): Promise<void> {
  return apiFetch<void>(`/api/admin/documents/${documentId}`, { method: 'DELETE' })
}

// Metrics

function metricsQuery(params: MetricsParams): string {
  const search = new URLSearchParams()
  if (params.from) search.set('from', params.from)
  if (params.to) search.set('to', params.to)
  if (params.groupBy) search.set('groupBy', params.groupBy)
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export function fetchMetrics(params: MetricsParams): Promise<MetricsResponse> {
  return apiFetch<MetricsResponse>(`/api/admin/metrics${metricsQuery(params)}`)
}

// The CSV export is a blob response that still needs the JWT, so it can go through
// neither apiFetch (which parses JSON) nor a plain <a href> (which can't carry the header).
export async function downloadMetricsCsv(params: MetricsParams): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/admin/metrics/export${metricsQuery(params)}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })

  if (res.status === 401) {
    throw clearAuthAndRedirect()
  }
  if (!res.ok) {
    throw (await res.json()) as ApiError
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'llm-usage-metrics.csv'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
