import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../utils/cn'
import { useScrollTop } from '../hooks/useScrollTop'
import { Sidebar, MobileSidebar } from '../components/layout/Sidebar'
import { Header } from '../components/layout/Header'

export function AppLayout() {
  const { t } = useTranslation()
  const collapsed = useAppStore((state) => state.sidebarCollapsed)
  const location = useLocation()
  useScrollTop()

  return (
    <div className="min-h-screen bg-[#f6f7fb] dark:bg-[#0b1020]">
      <Sidebar />
      <MobileSidebar />

      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-300',
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-[264px]',
        )}
      >
        <Header />

        <main className="flex-1 px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          <div className="mx-auto w-full max-w-[1600px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <footer className="border-t border-slate-200/60 px-3.5 py-4 dark:border-slate-800/60 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 sm:flex-row">
            <p>
              © {new Date().getFullYear()} SmartPOS. {t('app.footerRights')}
            </p>
            <p className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t('app.footerDemo')}
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
