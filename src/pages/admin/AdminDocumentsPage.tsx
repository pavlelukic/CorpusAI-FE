import { useState } from 'react'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteDocument, uploadDocument } from '@/api/admin'
import { useAdminSubjects } from '@/hooks/useAdminSubjects'
import { useDocuments } from '@/hooks/useDocuments'
import { useLang } from '@/lib/LangContext'
import { t, type Lang } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { ApiError, DocumentResponse } from '@/types'
import DocumentUpload from '@/components/admin/DocumentUpload'
import { Button } from '@/components/ui/button'
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const MAX_SIZE = 50 * 1024 * 1024
const ALLOWED = ['.pdf', '.md', '.txt']

const cardShadow =
  'shadow-[0_2px_6px_rgba(60,40,25,0.06),0_18px_40px_rgba(60,40,25,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]'

const statusStyles: Record<DocumentResponse['status'], string> = {
  PENDING: 'bg-[#b08a2e]/12 text-[#b08a2e] animate-pulse',
  INGESTING: 'bg-[#b08a2e]/12 text-[#b08a2e] animate-pulse',
  READY: 'bg-[#3f8f5e]/12 text-[#3f8f5e]',
  FAILED: 'bg-[#b4503f]/12 text-[#b4503f]',
}

function formatDate(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleString(lang === 'sr' ? 'sr-Latn-RS' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatusPill({ doc }: { doc: DocumentResponse }) {
  const { lang } = useLang()
  const label = t(`admin.documents.status.${doc.status}`, lang)
  const pill = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium',
        statusStyles[doc.status],
        doc.status === 'FAILED' && doc.errorMessage && 'cursor-help underline decoration-dotted underline-offset-2',
      )}
    >
      {doc.status === 'INGESTING' && <Loader2 className="size-3 animate-spin" />}
      {label}
    </span>
  )

  if (doc.status === 'FAILED' && doc.errorMessage) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{pill}</TooltipTrigger>
        <TooltipContent>{doc.errorMessage}</TooltipContent>
      </Tooltip>
    )
  }
  return pill
}

function AdminDocumentsPage() {
  const { subjectId = '' } = useParams()
  const { lang } = useLang()
  const queryClient = useQueryClient()

  const { data: subjects } = useAdminSubjects()
  const subject = subjects?.find((s) => s.id === subjectId)
  const { data: documents, isLoading, error, refetch } = useDocuments(subjectId)

  const [note, setNote] = useState<string | null>(null)
  const [replaceFile, setReplaceFile] = useState<File | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DocumentResponse | null>(null)

  const uploadMutation = useMutation<DocumentResponse, ApiError, File>({
    mutationFn: (file) => uploadDocument(subjectId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', subjectId] })
      toast.success(t('admin.documents.upload.success', lang))
      setNote(null)
    },
    onError: (err) => {
      setNote(
        err?.error === 'PAYLOAD_TOO_LARGE'
          ? t('admin.documents.upload.tooLarge', lang)
          : err?.message || t('error.generic', lang),
      )
    },
  })

  const deleteMutation = useMutation<void, ApiError, string>({
    mutationFn: (id) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', subjectId] })
      toast.success(t('admin.documents.deleteSuccess', lang))
      setDeleteTarget(null)
    },
    onError: (err) => {
      toast.error(err?.message || t('error.generic', lang))
    },
  })

  function handleFile(file: File) {
    const lower = file.name.toLowerCase()
    if (!ALLOWED.some((ext) => lower.endsWith(ext))) {
      setNote(t('admin.documents.upload.unsupported', lang))
      return
    }
    if (file.size > MAX_SIZE) {
      setNote(t('admin.documents.upload.tooLarge', lang))
      return
    }
    setNote(null)
    // Same file name = server-side replace. Warn before overwriting.
    if (documents?.some((d) => d.fileName === file.name)) {
      setReplaceFile(file)
      return
    }
    uploadMutation.mutate(file)
  }

  return (
    <TooltipProvider>
      <div>
        <Link
          to="/admin/subjects"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t('admin.documents.back', lang)}
        </Link>

        <div className="mt-3">
          <h1 className="font-heading text-[26px] font-medium tracking-[-0.01em] text-foreground">
            {subject?.displayName ?? subjectId}
          </h1>
          {subject && (
            <p className="text-[15px] text-muted-foreground">{subject.displayNameSr}</p>
          )}
          <p className="mt-1 text-[14px] text-muted-foreground">
            {t('admin.documents.subtitle', lang)}
          </p>
        </div>

        <div className="mt-6">
          <DocumentUpload onFile={handleFile} uploading={uploadMutation.isPending} />
          {note && <p className="mt-2 text-[13px] text-destructive">{note}</p>}
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
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : documents && documents.length === 0 ? (
            <p className="py-12 text-center text-[15px] text-muted-foreground">
              {t('admin.documents.empty', lang)}
            </p>
          ) : (
            <div className={`overflow-hidden rounded-2xl border border-border bg-card ${cardShadow}`}>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {t('admin.documents.col.name', lang)}
                    </TableHead>
                    <TableHead className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {t('admin.documents.col.status', lang)}
                    </TableHead>
                    <TableHead className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {t('admin.documents.col.uploaded', lang)}
                    </TableHead>
                    <TableHead className="px-4 text-right text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {t('admin.documents.col.actions', lang)}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents?.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="px-4 py-3 font-medium text-foreground">
                        {doc.fileName}
                      </TableCell>
                      <TableCell className="py-3">
                        <StatusPill doc={doc} />
                      </TableCell>
                      <TableCell className="py-3 text-[13px] text-muted-foreground">
                        {formatDate(doc.uploadedAt, lang)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(doc)}
                          >
                            <Trash2 />
                            {t('admin.documents.delete', lang)}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <AlertDialog
          open={replaceFile !== null}
          onOpenChange={(open) => {
            if (!open) setReplaceFile(null)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('admin.documents.replaceConfirm.title', lang)}</AlertDialogTitle>
              <AlertDialogDescription>
                {replaceFile &&
                  t('admin.documents.replaceConfirm.body', lang, { name: replaceFile.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('admin.common.cancel', lang)}</AlertDialogCancel>
              <Button
                onClick={() => {
                  if (replaceFile) uploadMutation.mutate(replaceFile)
                  setReplaceFile(null)
                }}
              >
                {t('admin.documents.replaceConfirm.confirm', lang)}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('admin.documents.deleteConfirm.title', lang)}</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteTarget &&
                  t('admin.documents.deleteConfirm.body', lang, { name: deleteTarget.fileName })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('admin.common.cancel', lang)}</AlertDialogCancel>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              >
                {t('admin.documents.deleteConfirm.confirm', lang)}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}

export default AdminDocumentsPage
