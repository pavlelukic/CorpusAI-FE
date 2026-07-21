import { useState } from 'react'
import { Archive, FileText, Pencil, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { archiveSubject } from '@/api/admin'
import { useAdminSubjects } from '@/hooks/useAdminSubjects'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import type { AdminSubject, ApiError } from '@/types'
import SubjectFormDialog from '@/components/admin/SubjectFormDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const cardShadow =
  'shadow-[0_2px_6px_rgba(60,40,25,0.06),0_18px_40px_rgba(60,40,25,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]'

function AdminSubjectsPage() {
  const { lang } = useLang()
  const { data: subjects, isLoading, error, refetch } = useAdminSubjects()
  const queryClient = useQueryClient()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminSubject | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<AdminSubject | null>(null)

  const archiveMutation = useMutation<void, ApiError, string>({
    mutationFn: (id) => archiveSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subjects'] })
      toast.success(t('admin.subjects.archiveSuccess', lang))
      setArchiveTarget(null)
    },
    onError: (err) => {
      toast.error(err?.message || t('error.generic', lang))
    },
  })

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(subject: AdminSubject) {
    setEditing(subject)
    setFormOpen(true)
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-[26px] font-medium tracking-[-0.01em] text-foreground">
            {t('admin.subjects.title', lang)}
          </h1>
          <p className="mt-1 text-[15px] text-muted-foreground">
            {t('admin.subjects.subtitle', lang)}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          {t('admin.subjects.new', lang)}
        </Button>
      </div>

      <div className="mt-8">
        {error ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-muted-foreground">{t('error.generic', lang)}</p>
            <Button variant="outline" onClick={() => refetch()}>
              {t('error.retry', lang)}
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : subjects && subjects.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Plus className="size-7" />
            </div>
            <p className="max-w-[420px] text-[15px] text-muted-foreground">
              {t('admin.subjects.empty', lang)}
            </p>
            <Button onClick={openCreate}>
              <Plus />
              {t('admin.subjects.new', lang)}
            </Button>
          </div>
        ) : (
          <div className={`overflow-hidden rounded-2xl border border-border bg-card ${cardShadow}`}>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {t('admin.subjects.col.subject', lang)}
                  </TableHead>
                  <TableHead className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {t('admin.subjects.col.slug', lang)}
                  </TableHead>
                  <TableHead className="px-4 text-right text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {t('admin.subjects.col.actions', lang)}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects?.map((subject) => (
                  <TableRow key={subject.id} className={subject.archived ? 'opacity-60' : undefined}>
                    <TableCell className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{subject.displayName}</span>
                          {subject.archived && (
                            <Badge variant="secondary" className="text-[11px]">
                              {t('admin.subjects.archivedBadge', lang)}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[13px] text-muted-foreground">
                          {subject.displayNameSr}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="rounded-md bg-muted px-2 py-1 font-mono text-[12px] text-muted-foreground">
                        {subject.id}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {!subject.archived && (
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="outline" size="sm" onClick={() => openEdit(subject)}>
                            <Pencil />
                            {t('admin.subjects.edit', lang)}
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/admin/subjects/${subject.id}/documents`}>
                              <FileText />
                              {t('admin.subjects.documents', lang)}
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setArchiveTarget(subject)}
                          >
                            <Archive />
                            {t('admin.subjects.archive', lang)}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <SubjectFormDialog open={formOpen} onOpenChange={setFormOpen} subject={editing} />

      <AlertDialog
        open={archiveTarget !== null}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.subjects.archiveConfirm.title', lang)}</AlertDialogTitle>
            <AlertDialogDescription>
              {archiveTarget &&
                t('admin.subjects.archiveConfirm.body', lang, {
                  name: archiveTarget.displayName,
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.common.cancel', lang)}</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={archiveMutation.isPending}
              onClick={() => archiveTarget && archiveMutation.mutate(archiveTarget.id)}
            >
              {t('admin.subjects.archiveConfirm.confirm', lang)}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AdminSubjectsPage
