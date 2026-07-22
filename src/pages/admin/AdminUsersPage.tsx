import { useState } from 'react'
import { Settings2 } from 'lucide-react'
import { useAdminUsers } from '@/hooks/useAdminUsers'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import ManageAccessDialog from '@/components/admin/ManageAccessDialog'
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

const cardShadow =
  'shadow-[0_2px_6px_rgba(60,40,25,0.06),0_18px_40px_rgba(60,40,25,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]'

const headCell =
  'text-[12px] font-semibold tracking-wide text-muted-foreground uppercase'

function AdminUsersPage() {
  const { lang } = useLang()
  const { data: users, isLoading, error, refetch } = useAdminUsers()
  const [manageUserId, setManageUserId] = useState<string | null>(null)

  return (
    <div>
      <div>
        <h1 className="font-heading text-[26px] font-medium tracking-[-0.01em] text-foreground">
          {t('admin.users.title', lang)}
        </h1>
        <p className="mt-1 text-[15px] text-muted-foreground">{t('admin.users.subtitle', lang)}</p>
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
        ) : users && users.length === 0 ? (
          <p className="py-12 text-center text-[15px] text-muted-foreground">
            {t('admin.users.empty', lang)}
          </p>
        ) : (
          <div className={`overflow-hidden rounded-2xl border border-border bg-card ${cardShadow}`}>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className={cn('px-4', headCell)}>
                    {t('admin.users.col.name', lang)}
                  </TableHead>
                  <TableHead className={headCell}>{t('admin.users.col.email', lang)}</TableHead>
                  <TableHead className={cn(headCell, 'w-[140px]')}>
                    {t('admin.users.col.role', lang)}
                  </TableHead>
                  <TableHead className={headCell}>{t('admin.users.col.subjects', lang)}</TableHead>
                  <TableHead className={cn('px-4 text-right', headCell)}>
                    {t('admin.users.col.actions', lang)}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => {
                  const isAdmin = user.role === 'ADMIN'
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="px-4 py-3 font-medium text-foreground">
                        {user.displayName}
                      </TableCell>
                      <TableCell className="py-3 text-[13px] text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell className="py-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium',
                            isAdmin
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {t(isAdmin ? 'auth.role.ADMIN' : 'auth.role.USER', lang)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        {isAdmin ? (
                          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[12px] font-medium text-primary">
                            {t('admin.users.allAccess', lang)}
                          </span>
                        ) : user.subjectIds.length === 0 ? (
                          <span className="text-[13px] text-muted-foreground">
                            {t('admin.users.noAccess', lang)}
                          </span>
                        ) : (
                          <div className="flex max-w-[320px] flex-wrap gap-1.5">
                            {user.subjectIds.map((slug) => (
                              <span
                                key={slug}
                                className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                              >
                                {slug}
                              </span>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isAdmin}
                            onClick={() => setManageUserId(user.id)}
                          >
                            <Settings2 />
                            {t('admin.users.manage', lang)}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ManageAccessDialog
        open={manageUserId !== null}
        onOpenChange={(open) => {
          if (!open) setManageUserId(null)
        }}
        userId={manageUserId}
      />
    </div>
  )
}

export default AdminUsersPage
