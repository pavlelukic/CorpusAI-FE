import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createChat, deleteChat, listChats } from '@/api/chats'
import { useSubjects } from '@/hooks/useSubjects'
import { useLang } from '@/lib/LangContext'
import { t, type Lang } from '@/lib/i18n'
import type { ApiError, ChatSession, ModelProvider } from '@/types'

interface CreateVars {
  lang: Lang
  provider: ModelProvider
}

/**
 * Resolves a session from its id alone, which the conversation route is all it gets. There is no
 * GET /api/chats/{id} in the contract, so a cold deep link falls back to listing the caller's
 * sessions per granted subject; those lists are seeded into the cache so the work isn't wasted.
 */
export function useChatSession(sessionId: string) {
  const queryClient = useQueryClient()
  const { subjects } = useSubjects()

  const cached = queryClient
    .getQueriesData<ChatSession[]>({ queryKey: ['chats'] })
    .flatMap(([, sessions]) => sessions ?? [])
    .find((session) => session.id === sessionId)

  const { data } = useQuery<ChatSession | null>({
    queryKey: ['chatSession', sessionId],
    enabled: !cached && sessionId.length > 0 && subjects !== undefined,
    queryFn: async () => {
      const lists = await Promise.all(
        (subjects ?? []).map(async (subject) => {
          const sessions = await listChats(subject.id)
          queryClient.setQueryData(['chats', subject.id], sessions)
          return sessions
        }),
      )
      return lists.flat().find((session) => session.id === sessionId) ?? null
    },
  })

  return cached ?? data ?? null
}

export function useChatSessions(subjectId: string) {
  const { lang } = useLang()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['chats', subjectId],
    queryFn: () => listChats(subjectId),
    enabled: subjectId.length > 0,
  })

  const createMutation = useMutation<ChatSession, ApiError, CreateVars>({
    mutationFn: (vars) => createChat({ subjectId, ...vars }),
    onSuccess: (session) => {
      // The server orders by last activity, so a brand-new session belongs on top.
      queryClient.setQueryData<ChatSession[]>(['chats', subjectId], (prev) =>
        prev ? [session, ...prev] : [session],
      )
    },
    onError: (err) => {
      toast.error(err?.message || t('error.generic', lang))
    },
  })

  const deleteMutation = useMutation<void, ApiError, string>({
    mutationFn: (sessionId) => deleteChat(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.setQueryData<ChatSession[]>(['chats', subjectId], (prev) =>
        prev?.filter((session) => session.id !== sessionId),
      )
      queryClient.removeQueries({ queryKey: ['chatMessages', sessionId] })
      queryClient.removeQueries({ queryKey: ['chatUsage', sessionId] })
      toast.success(t('chat.sessions.deleteSuccess', lang))
    },
    onError: (err) => {
      toast.error(err?.message || t('error.generic', lang))
    },
  })

  return {
    sessions: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createSession: createMutation.mutate,
    isCreating: createMutation.isPending,
    deleteSession: deleteMutation.mutate,
    deletingId: deleteMutation.isPending ? deleteMutation.variables : null,
  }
}
