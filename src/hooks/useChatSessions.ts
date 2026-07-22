import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createChat, deleteChat, listChats } from '@/api/chats'
import { useLang } from '@/lib/LangContext'
import { t, type Lang } from '@/lib/i18n'
import type { ApiError, ChatSession, ModelProvider } from '@/types'

interface CreateVars {
  lang: Lang
  provider: ModelProvider
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
