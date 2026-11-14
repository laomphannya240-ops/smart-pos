import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, LockKeyhole, ShieldAlert } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { homePathForRole } from '../../utils/permissions'
import { Button } from '../../components/ui/Button'

export function Unauthorized() {
  const { t } = useTranslation()
  const session = useAppStore((state) => state.session)
  const home = homePathForRole(session?.role)

  return (
    <div className="flex min-h-[68vh] items-center justify-center py-10">
      <div className="w-full max-w-xl text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-500 shadow-inner dark:bg-rose-500/10 dark:text-rose-400">
          <ShieldAlert className="h-9 w-9" />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-rose-500">
          403 · {t('errors.forbidden')}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {t('errors.forbiddenTitle')}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {t('errors.forbiddenDescription', { role: t(`role.${session?.role}`) })}
        </p>

        <div className="mx-auto mt-6 flex max-w-md items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-left text-[11px] leading-relaxed text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
          {t('errors.forbiddenDemoNote')}
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          <Link to={home}>
            <Button leftIcon={ArrowLeft}>{t('errors.goToMyArea')}</Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline">{t('nav.profile')}</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
