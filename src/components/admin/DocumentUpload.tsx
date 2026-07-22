import { useRef, useState, type DragEvent, type KeyboardEvent } from 'react'
import { Loader2, UploadCloud } from 'lucide-react'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface DocumentUploadProps {
  /** Reports the first chosen file. Validation/collision handling lives in the page. */
  onFile: (file: File) => void
  uploading?: boolean
}

function DocumentUpload({ onFile, uploading = false }: DocumentUploadProps) {
  const { lang } = useLang()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  function pick(files: FileList | null) {
    if (!uploading && files && files.length > 0) onFile(files[0])
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    setDragActive(false)
    pick(event.dataTransfer.files)
  }

  function handleKeyDown(event: KeyboardEvent) {
    if ((event.key === 'Enter' || event.key === ' ') && !uploading) {
      event.preventDefault()
      inputRef.current?.click()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={uploading}
      onClick={() => !uploading && inputRef.current?.click()}
      onKeyDown={handleKeyDown}
      onDragOver={(e) => {
        e.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        setDragActive(false)
      }}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-6 py-10 text-center transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        dragActive ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/40',
        uploading ? 'pointer-events-none opacity-70' : 'cursor-pointer',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.md,.txt"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files)
          e.target.value = ''
        }}
      />
      {uploading ? (
        <Loader2 className="size-6 animate-spin text-primary" />
      ) : (
        <UploadCloud className="size-6 text-primary" />
      )}
      <div className="flex flex-col gap-0.5">
        <span className="text-[15px] font-medium text-foreground">
          {uploading
            ? t('admin.documents.upload.uploading', lang)
            : t('admin.documents.upload.title', lang)}
        </span>
        {!uploading && (
          <span className="text-[13px] text-muted-foreground">
            {t('admin.documents.upload.browse', lang)}
          </span>
        )}
        <span className="mt-1 text-[12px] text-muted-foreground">
          {t('admin.documents.upload.hint', lang)}
        </span>
      </div>
    </div>
  )
}

export default DocumentUpload
