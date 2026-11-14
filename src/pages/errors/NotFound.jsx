import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Compass, Home } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { homePathForRole } from '../../utils/permissions'
import { Button } from '../../components/ui/Button'

export function NotFound() {
  const { t } = useTranslation()
  const session = useAppStore((state) => state.session)

  return (
    <div className="flex min-h-[68vh] items-center justify-center py-10">
      <div className="w-full max-w-lg text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400">
          <Compass className="h-9 w-9" />
        </span>
        <p className="mt-6 text-6xl font-extrabold tracking-tight text-slate-200 dark:text-slate-800">
          404
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('errors.notFoundTitle')}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {t('errors.notFoundDescription')}
        </p>
        <Link to={homePathForRole(session?.role)} className="mt-7 inline-block">
          <Button leftIcon={Home}>{t('errors.backHome')}</Button>
        </Link>
      </div>
    </div>
  )
}
