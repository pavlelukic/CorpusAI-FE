import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Outlet } from 'react-router'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import AppHeader from '@/components/AppHeader'
import AdminSidebar from '@/components/admin/AdminSidebar'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

function AdminLayout() {
  const { lang } = useLang()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <AppHeader containerClassName="max-w-[1360px] px-6" />
      <div className="mx-auto w-full max-w-[1360px] px-6">
        <div className="py-3 md:hidden">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger
              aria-label={t('admin.nav.openMenu', lang)}
              className="flex items-center gap-2 rounded-[10px] border border-border bg-card px-3 py-2 text-[14px] font-medium text-foreground"
            >
              <Menu className="size-[18px]" />
              {t('admin.link', lang)}
            </SheetTrigger>
            <SheetContent side="left" className="w-64 gap-0">
              <SheetHeader>
                <SheetTitle>{t('admin.link', lang)}</SheetTitle>
                <SheetDescription className="sr-only">
                  {t('admin.nav.openMenu', lang)}
                </SheetDescription>
              </SheetHeader>
              <div className="px-3 pb-4">
                <AdminSidebar onNavigate={() => setDrawerOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8 pb-14 md:pt-8">
          <aside className="hidden w-56 shrink-0 md:block">
            <div className="sticky top-20">
              <AdminSidebar />
            </div>
          </aside>
          <main className="min-w-0 flex-1 pb-6 md:py-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
