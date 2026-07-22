import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createSubject, updateSubject } from '@/api/admin'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import type { AdminSubject, ApiError, SubjectRequest } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface SubjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null → create mode; an AdminSubject → edit mode (prefilled). */
  subject: AdminSubject | null
}

/** `displayName` holds the Serbian Latin name (the slug is derived from it);
 *  `displayNameSr` holds the Serbian Cyrillic name. */
function SubjectFormDialog({ open, onOpenChange, subject }: SubjectFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* Keyed so the form remounts with fresh state each time it's opened. */}
        <SubjectForm key={subject?.id ?? 'new'} subject={subject} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function SubjectForm({ subject, onClose }: { subject: AdminSubject | null; onClose: () => void }) {
  const { lang } = useLang()
  const queryClient = useQueryClient()
  const isEdit = subject !== null

  const [nameLatin, setNameLatin] = useState(subject?.displayName ?? '')
  const [nameCyrillic, setNameCyrillic] = useState(subject?.displayNameSr ?? '')
  const [systemPrompt, setSystemPrompt] = useState(subject?.systemPrompt ?? '')
  const [errors, setErrors] = useState<{ latin?: string; cyrillic?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)

  const mutation = useMutation<AdminSubject, ApiError, SubjectRequest>({
    mutationFn: (body) => (isEdit ? updateSubject(subject.id, body) : createSubject(body)),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-subjects'] })
      toast.success(
        isEdit
          ? t('admin.subjects.updated', lang)
          : t('admin.subjects.created', lang, { slug: result.id }),
      )
      onClose()
    },
    onError: (err) => {
      setFormError(
        err?.error === 'CONFLICT'
          ? t('admin.subjects.form.duplicate', lang)
          : err?.message || t('error.generic', lang),
      )
    },
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors: typeof errors = {}
    if (!nameLatin.trim()) nextErrors.latin = t('admin.subjects.form.nameLatinRequired', lang)
    if (!nameCyrillic.trim()) {
      nextErrors.cyrillic = t('admin.subjects.form.nameCyrillicRequired', lang)
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setFormError(null)
    const prompt = systemPrompt.trim()
    mutation.mutate({
      displayName: nameLatin.trim(),
      displayNameSr: nameCyrillic.trim(),
      systemPrompt: prompt.length > 0 ? prompt : null,
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {t(isEdit ? 'admin.subjects.form.editTitle' : 'admin.subjects.form.createTitle', lang)}
        </DialogTitle>
        <DialogDescription>
          {t(
            isEdit ? 'admin.subjects.form.editDescription' : 'admin.subjects.form.createDescription',
            lang,
          )}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="subject-name-latin">{t('admin.subjects.form.nameLatin', lang)}</Label>
          <Input
            id="subject-name-latin"
            value={nameLatin}
            onChange={(e) => setNameLatin(e.target.value)}
            maxLength={255}
            aria-invalid={Boolean(errors.latin)}
            autoFocus
          />
          {errors.latin && <p className="text-[13px] text-destructive">{errors.latin}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="subject-name-cyrillic">
            {t('admin.subjects.form.nameCyrillic', lang)}
          </Label>
          <Input
            id="subject-name-cyrillic"
            value={nameCyrillic}
            onChange={(e) => setNameCyrillic(e.target.value)}
            maxLength={255}
            aria-invalid={Boolean(errors.cyrillic)}
          />
          {errors.cyrillic && <p className="text-[13px] text-destructive">{errors.cyrillic}</p>}
        </div>

        {isEdit && (
          <div className="flex flex-col gap-1.5">
            <Label>{t('admin.subjects.form.slugLabel', lang)}</Label>
            <div className="rounded-md border border-input bg-muted/40 px-3 py-2 font-mono text-[13px] text-muted-foreground">
              {subject.id}
            </div>
            <p className="text-[12px] text-muted-foreground">
              {t('admin.subjects.form.slugHint', lang)}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="subject-prompt">{t('admin.subjects.form.systemPrompt', lang)}</Label>
          <Textarea
            id="subject-prompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            maxLength={10000}
            rows={5}
          />
          <p className="text-[12px] text-muted-foreground">
            {t('admin.subjects.form.systemPromptHint', lang)}
          </p>
        </div>

        {formError && <p className="text-[13px] text-destructive">{formError}</p>}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('admin.common.cancel', lang)}
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? t(isEdit ? 'admin.subjects.form.saving' : 'admin.subjects.form.creating', lang)
              : t(isEdit ? 'admin.subjects.form.save' : 'admin.subjects.form.create', lang)}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

export default SubjectFormDialog
