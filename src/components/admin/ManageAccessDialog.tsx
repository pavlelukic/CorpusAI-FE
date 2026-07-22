import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { grantAccess, revokeAccess } from '@/api/admin'
import { useAdminUsers } from '@/hooks/useAdminUsers'
import { useAdminSubjects } from '@/hooks/useAdminSubjects'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import type { AdminSubject, AdminUser, ApiError } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ManageAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string | null
}

type MutationContext = { previous?: AdminUser[] }

const withSubject = (users: AdminUser[] | undefined, userId: string, subjectId: string, granted: boolean) =>
  users?.map((u) =>
    u.id === userId
      ? {
          ...u,
          subjectIds: granted
            ? [...new Set([...u.subjectIds, subjectId])]
            : u.subjectIds.filter((id) => id !== subjectId),
        }
      : u,
  )

function ManageAccessDialog({ open, onOpenChange, userId }: ManageAccessDialogProps) {
  const { lang } = useLang()
  const queryClient = useQueryClient()

  const { data: users } = useAdminUsers()
  const { data: subjects } = useAdminSubjects()
  const user = users?.find((u) => u.id === userId)
  const grantable = subjects?.filter((s) => !s.archived) ?? []
  const granted = new Set(user?.subjectIds ?? [])

  const [revokeSubject, setRevokeSubject] = useState<AdminSubject | null>(null)

  const grantMutation = useMutation<void, ApiError, string, MutationContext>({
    mutationFn: (subjectId) => grantAccess(userId as string, subjectId),
    onSuccess: () => toast.success(t('admin.users.grantSuccess', lang)),
    ...optimisticFactory(true),
  })

  const revokeMutation = useMutation<void, ApiError, string, MutationContext>({
    mutationFn: (subjectId) => revokeAccess(userId as string, subjectId),
    onSuccess: () => toast.success(t('admin.users.revokeSuccess', lang)),
    ...optimisticFactory(false),
  })

  // Shared optimistic handlers; `grant` decides whether we add or remove the subject.
  function optimisticFactory(grant: boolean) {
    return {
      onMutate: async (subjectId: string): Promise<MutationContext> => {
        await queryClient.cancelQueries({ queryKey: ['admin-users'] })
        const previous = queryClient.getQueryData<AdminUser[]>(['admin-users'])
        queryClient.setQueryData<AdminUser[]>(['admin-users'], (old) =>
          userId ? withSubject(old, userId, subjectId, grant) : old,
        )
        return { previous }
      },
      onError: (err: ApiError, _subjectId: string, ctx: MutationContext | undefined) => {
        if (ctx?.previous) queryClient.setQueryData(['admin-users'], ctx.previous)
        toast.error(err?.message || t('error.generic', lang))
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
    }
  }

  function handleToggle(subject: AdminSubject, checked: boolean) {
    if (checked) grantMutation.mutate(subject.id)
    else setRevokeSubject(subject)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('admin.users.manage.title', lang)}</DialogTitle>
          <DialogDescription>
            {user ? user.email : t('admin.users.manage.subtitle', lang)}
          </DialogDescription>
        </DialogHeader>

        {grantable.length === 0 ? (
          <p className="py-4 text-[14px] text-muted-foreground">
            {t('admin.users.manage.noSubjects', lang)}
          </p>
        ) : (
          <div className="flex max-h-[55vh] flex-col divide-y divide-border overflow-x-hidden overflow-y-auto">
            {grantable.map((subject) => (
              <div key={subject.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-[14px] font-medium text-foreground">
                    {subject.displayName}
                  </span>
                  <span className="truncate text-[12px] text-muted-foreground">
                    {subject.displayNameSr}
                  </span>
                </div>
                <Switch
                  checked={granted.has(subject.id)}
                  onCheckedChange={(checked) => handleToggle(subject, checked)}
                  aria-label={subject.displayName}
                />
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('admin.users.manage.done', lang)}
          </Button>
        </DialogFooter>

        {/* Nested inside DialogContent so Radix treats it as a child layer -
            confirming here must not dismiss the Manage-access dialog. */}
        <AlertDialog
          open={revokeSubject !== null}
          onOpenChange={(o) => {
            if (!o) setRevokeSubject(null)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('admin.users.revokeConfirm.title', lang)}</AlertDialogTitle>
              <AlertDialogDescription>
                {revokeSubject &&
                  t('admin.users.revokeConfirm.body', lang, { subject: revokeSubject.displayName })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('admin.common.cancel', lang)}</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={() => {
                  if (revokeSubject) revokeMutation.mutate(revokeSubject.id)
                  setRevokeSubject(null)
                }}
              >
                {t('admin.users.revokeConfirm.confirm', lang)}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  )
}

export default ManageAccessDialog
