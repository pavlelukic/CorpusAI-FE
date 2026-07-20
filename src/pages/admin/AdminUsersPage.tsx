import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'

function AdminUsersPage() {
  const { lang } = useLang()

  return (
    <div>
      <h1 className="font-heading text-[26px] font-medium tracking-[-0.01em] text-foreground">
        {t('admin.users.title', lang)}
      </h1>
    </div>
  )
}

export default AdminUsersPage
