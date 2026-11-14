import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { navSections, pageTitleKeys } from '../../routes/navigation'
import { homePathForRole } from '../../utils/permissions'

export function Breadcrumbs() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const role = useAppStore((state) => state.session?.role)

  const segment = pathname.split('/').filter(Boolean)[0] || 'dashboard'
  const section = navSections.find((entry) =>
    entry.items.some((item) => item.key === segment),
  )
  const titleKey =
    pageTitleKeys[segment] || (segment ? `errors.notFoundTitle` : 'nav.dashboard')

  return (
    <nav
      aria-label={t('common.breadcrumb')}
      className="hidden min-w-0 items-center gap-1.5 text-xs md:flex"
    >
      <Link
        to={homePathForRole(role)}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        title={t('common.home')}
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {section && (
        <>
          <ChevronRight className="h-3 w-3 shrink-0 text-slate-300 dark:text-slate-600" />
          <span className="truncate text-slate-400 dark:text-slate-500">
            {t(section.key)}
          </span>
        </>
      )}

      <ChevronRight className="h-3 w-3 shrink-0 text-slate-300 dark:text-slate-600" />
      <span className="truncate font-semibold text-slate-700 dark:text-slate-200">
        {t(titleKey)}
      </span>
    </nav>
  )
}
