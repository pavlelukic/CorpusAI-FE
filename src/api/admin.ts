import { apiFetch } from '@/lib/api'
import type { AdminSubject, AdminUser, DocumentResponse, SubjectRequest } from '@/types'

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
