import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  Bell,
  CheckCheck,
  ChevronDown,
  Globe2,
  LogOut,
  Menu,
  Moon,
  Plus,
  Settings,
  Sun,
  User,
  UserCog,
  KeyRound,
  CircleDot,
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useDataStore } from '../../store/useDataStore'
import { cn } from '../../utils/cn'
import { canAccess } from '../../utils/permissions'
import { Dropdown, DropdownItem } from '../ui/Dropdown'
import { Avatar } from '../ui/Avatar'
import { Breadcrumbs } from './Breadcrumbs'
import { useActivityContent } from '../common/ActivityItem'
import { buttonStyles } from '../ui/Button'

const languages = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'km', label: 'ខ្មែរ', short: 'KM' },
]

const activityTargets = {
  sale: '/sales',
  stock: '/inventory',
  purchase: '/purchases',
  customer: '/customers',
  expense: '/expenses',
  product: '/products',
  category: '/categories',
  supplier: '/suppliers',
  user: '/users',
}

export function LanguageSwitcher() {
  const { t } = useTranslation()
  const language = useAppStore((state) => state.language)
  const setLanguage = useAppStore((state) => state.setLanguage)
  const current = languages.find((item) => item.code === language) || languages[0]

  return (
    <Dropdown
      width="w-48"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label={t('common.language')}
          className={cn(
            'flex h-9 items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 sm:px-2.5',
            open && 'border-indigo-300 ring-4 ring-indigo-500/10 dark:border-indigo-500/50',
          )}
        >
          <Globe2 className="h-4 w-4 text-slate-400" />
          <span className="hidden sm:inline">{current.short}</span>
          <ChevronDown className="hidden h-3 w-3 text-slate-400 sm:block" />
        </button>
      )}
    >
      {(close) =>
        languages.map((item) => (
          <DropdownItem
            key={item.code}
            active={item.code === language}
            onClick={() => {
              setLanguage(item.code)
              close()
            }}
            icon={item.code === 'km' ? Globe2 : Globe2}
          >
            <span
              className={cn(
                'flex items-center justify-between gap-2',
                item.code === 'km' && 'font-khmer',
              )}
            >
              {item.label}
              {item.code === language && (
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              )}
            </span>
          </DropdownItem>
        ))
      }
    </Dropdown>
  )
}

export function ThemeToggle() {
  const { t } = useTranslation()
  const theme = useAppStore((state) => state.theme)
  const toggleTheme = useAppStore((state) => state.toggleTheme)
  const dark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t(dark ? 'common.lightMode' : 'common.darkMode')}
      title={t(dark ? 'common.lightMode' : 'common.darkMode')}
      className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <Sun
        className={cn(
          'absolute h-4 w-4 transition-all duration-300',
          dark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0',
        )}
      />
      <Moon
        className={cn(
          'absolute h-4 w-4 transition-all duration-300',
          dark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100',
        )}
      />
    </button>
  )
}

function NotificationDropdown() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const activities = useDataStore((state) => state.activities)
  const role = useAppStore((state) => state.session?.role)
  const [unread, setUnread] = useState(4)
  const notifications = activities.slice(0, 6)

  function openActivity(activity, close) {
    const moduleKey = String(activity.action).split('.')[0]
    const target = activityTargets[moduleKey] || '/dashboard'
    if (canAccess(role, target.replace('/', ''))) {
      navigate(target)
    }
    setUnread((value) => Math.max(0, value - 1))
    close()
  }

  return (
    <Dropdown
      width="w-[340px]"
      panelClassName="p-0"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label={t('common.notifications')}
          className={cn(
            'relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
            open && 'border-indigo-300 ring-4 ring-indigo-500/10 dark:border-indigo-500/50',
          )}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
              {unread}
            </span>
          )}
        </button>
      )}
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between px-3 py-2.5">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {t('common.notifications')}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {unread > 0 ? t('notifications.unread', { count: unread }) : t('notifications.allRead')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUnread(0)}
              disabled={unread === 0}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {t('notifications.markAllRead')}
            </button>
          </div>
          <div className="max-h-[340px] overflow-y-auto border-t border-slate-100 dark:border-slate-800">
            {notifications.length === 0 ? (
              <p className="px-3 py-10 text-center text-xs text-slate-400">
                {t('notifications.empty')}
              </p>
            ) : (
              notifications.map((activity) => (
                <NotificationRow
                  key={activity.id}
                  activity={activity}
                  onClick={() => openActivity(activity, close)}
                />
              ))
            )}
          </div>
          <div className="border-t border-slate-100 p-1.5 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                navigate(canAccess(role, 'dashboard') ? '/dashboard' : '/pos')
                close()
              }}
              className="w-full rounded-lg px-3 py-2 text-center text-[11px] font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
            >
              {t('notifications.viewAll')}
            </button>
          </div>
        </div>
      )}
    </Dropdown>
  )
}

function NotificationRow({ activity, onClick }) {
  const { Icon, tone, text } = useActivityContent(activity)
  const toneMap = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
    sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-2.5 border-b border-slate-50 px-3 py-2.5 text-left transition last:border-0 hover:bg-slate-50/80 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
    >
      <span
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          toneMap[tone] || toneMap.indigo,
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          {text}
        </span>
        <span className="mt-0.5 block text-[10px] text-slate-400 dark:text-slate-500">
          {new Date(activity.createdAt).toLocaleString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short',
          })}
        </span>
      </span>
      <CircleDot className="mt-2 h-2.5 w-2.5 shrink-0 text-indigo-400" />
    </button>
  )
}

function UserMenu() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const session = useAppStore((state) => state.session)
  const logout = useAppStore((state) => state.logout)

  function handleLogout() {
    logout()
    toast.success(t('auth.loggedOut'))
    navigate('/login')
  }

  return (
    <Dropdown
      width="w-64"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'flex items-center gap-2 rounded-xl border border-transparent py-1 pl-1 pr-1.5 transition hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800',
            open && 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800',
          )}
        >
          <Avatar name={session?.name} size="sm" status="online" />
          <span className="hidden min-w-0 text-left xl:block">
            <span className="block max-w-[130px] truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
              {session?.name}
            </span>
            <span className="block text-[10px] text-slate-400 dark:text-slate-500">
              {t(`role.${session?.role}`)}
            </span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>
      )}
    >
      {(close) => (
        <div>
          <div className="flex items-center gap-3 border-b border-slate-100 px-3 py-3 dark:border-slate-800">
            <Avatar name={session?.name} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {session?.name}
              </p>
              <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
                {session?.email}
              </p>
            </div>
          </div>
          <div className="p-1">
            <DropdownItem
              icon={User}
              onClick={() => {
                navigate('/profile')
                close()
              }}
            >
              {t('nav.profile')}
            </DropdownItem>
            <DropdownItem
              icon={KeyRound}
              onClick={() => {
                navigate('/change-password')
                close()
              }}
            >
              {t('nav.changePassword')}
            </DropdownItem>
            {canAccess(session?.role, 'settings') && (
              <DropdownItem
                icon={Settings}
                onClick={() => {
                  navigate('/settings')
                  close()
                }}
              >
                {t('nav.settings')}
              </DropdownItem>
            )}
            {canAccess(session?.role, 'users') && (
              <DropdownItem
                icon={UserCog}
                onClick={() => {
                  navigate('/users')
                  close()
                }}
              >
                {t('nav.users')}
              </DropdownItem>
            )}
          </div>
          <div className="border-t border-slate-100 p-1 dark:border-slate-800">
            <DropdownItem icon={LogOut} danger onClick={handleLogout}>
              {t('auth.logout')}
            </DropdownItem>
          </div>
        </div>
      )}
    </Dropdown>
  )
}

export function Header() {
  const { t } = useTranslation()
  const role = useAppStore((state) => state.session?.role)
  const setMobileSidebarOpen = useAppStore((state) => state.setMobileSidebarOpen)

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/85">
      <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 lg:hidden"
          aria-label={t('common.openMenu')}
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        <Breadcrumbs />

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div className="mr-1 hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 md:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            {t('app.storeOpen')}
          </div>

          {canAccess(role, 'pos') && (
            <Link
              to="/pos"
              className={buttonStyles({
                variant: 'primary',
                size: 'sm',
                className: 'hidden md:inline-flex',
              })}
            >
              <Plus className="h-3.5 w-3.5" />
              {t('dashboard.newSale')}
            </Link>
          )}

          <LanguageSwitcher />
          <ThemeToggle />
          <NotificationDropdown />

          <div className="mx-1 hidden h-6 w-px bg-slate-200 dark:bg-slate-700 sm:block" />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
