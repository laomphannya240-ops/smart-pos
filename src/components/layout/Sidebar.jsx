import { Link, useLocation } from 'react-router-dom'
import { ChevronsLeft, ChevronsRight, Store, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../store/useAppStore'
import { canAccess } from '../../utils/permissions'
import { navSections } from '../../routes/navigation'
import { cn } from '../../utils/cn'
import { Badge } from '../ui/Badge'

function SidebarContent({ collapsed = false, mobile = false, onNavigate }) {
  const { t } = useTranslation()
  const location = useLocation()
  const role = useAppStore((state) => state.session?.role)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const setMobileSidebarOpen = useAppStore((state) => state.setMobileSidebarOpen)

  const sections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccess(role, item.module)),
    }))
    .filter((section) => section.items.length > 0)

  function isActive(to) {
    return location.pathname === to || location.pathname.startsWith(`${to}/`)
  }

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 dark:border-slate-800',
          collapsed ? 'justify-center px-2' : 'px-5',
        )}
      >
        <Link
          to={role === 'cashier' ? '/pos' : '/dashboard'}
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-3"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <Store className="h-5 w-5" />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
                SmartPOS
              </span>
              <span className="block truncate text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                {t('app.tagline')}
              </span>
            </span>
          )}
        </Link>
        {mobile && (
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label={t('common.closeMenu')}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.key} className="mb-5 last:mb-0">
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                {t(section.key)}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.to)
                return (
                  <li key={item.key}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      title={collapsed ? t(`nav.${item.key}`) : undefined}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all duration-200',
                        collapsed ? 'justify-center px-2' : 'px-3',
                        active
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-105',
                          active
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300',
                        )}
                      />
                      {!collapsed && <span className="truncate">{t(`nav.${item.key}`)}</span>}
                      {!collapsed && item.key === 'pos' && (
                        <span className="ml-auto rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                          {t('common.live')}
                        </span>
                      )}
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-indigo-600 dark:bg-indigo-400" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-slate-100 p-3 dark:border-slate-800">
        {!collapsed && (
          <div className="mb-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 dark:border-indigo-500/20 dark:bg-indigo-500/10">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                {t('app.demoWorkspace')}
              </p>
              <Badge tone="indigo">v1.0</Badge>
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-indigo-600/70 dark:text-indigo-300/70">
              {t('app.demoWorkspaceHint')}
            </p>
          </div>
        )}
        {!mobile && (
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200',
              collapsed && 'justify-center px-2',
            )}
            title={t(collapsed ? 'common.expand' : 'common.collapse')}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4" />
                <span>{t('common.collapse')}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export function Sidebar() {
  const collapsed = useAppStore((state) => state.sidebarCollapsed)
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden border-r border-slate-200/80 bg-white transition-[width] duration-300 dark:border-slate-800 dark:bg-slate-900 lg:block',
        collapsed ? 'w-[76px]' : 'w-[264px]',
      )}
    >
      <SidebarContent collapsed={collapsed} />
    </aside>
  )
}

export function MobileSidebar() {
  const mobileOpen = useAppStore((state) => state.mobileSidebarOpen)
  const setMobileSidebarOpen = useAppStore((state) => state.setMobileSidebarOpen)

  return (
    <div
      className={cn(
        'fixed inset-0 z-[70] lg:hidden',
        mobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={!mobileOpen}
    >
      <div
        className={cn(
          'absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] transition-opacity duration-300',
          mobileOpen ? 'opacity-100' : 'opacity-0',
        )}
        onClick={() => setMobileSidebarOpen(false)}
      />
      <aside
        className={cn(
          'absolute inset-y-0 left-0 w-[280px] border-r border-slate-200/80 bg-white shadow-2xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarContent mobile onNavigate={() => setMobileSidebarOpen(false)} />
      </aside>
    </div>
  )
}
