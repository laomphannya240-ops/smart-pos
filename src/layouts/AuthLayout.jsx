import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart3,
  CheckCircle2,
  Globe2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { LanguageSwitcher, ThemeToggle } from '../components/layout/Header'
import { BrandMark } from '../components/common/BrandMark'

const features = [
  { key: 'analytics', icon: BarChart3 },
  { key: 'multilingual', icon: Globe2 },
  { key: 'roles', icon: ShieldCheck },
]

function PreviewCard() {
  const { t } = useTranslation()
  const bars = [38, 52, 44, 68, 58, 82, 72, 94, 70, 88, 62, 78]

  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-200/70">
            {t('auth.previewLabel')}
          </p>
          <p className="mt-1 text-2xl font-bold text-white">$12,480.50</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-bold text-emerald-300">
          <TrendingUp className="h-3 w-3" />
          +18.2%
        </span>
      </div>

      <div className="mt-5 flex h-16 items-end gap-1.5">
        {bars.map((height, index) => (
          <div
            key={index}
            className="flex-1 rounded-t bg-gradient-to-t from-indigo-500/40 to-indigo-300/80"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-white/50">
        <span>{t('auth.previewFoot')}</span>
        <span className="inline-flex items-center gap-1 text-emerald-300">
          <CheckCircle2 className="h-3 w-3" />
          {t('auth.previewLive')}
        </span>
      </div>
    </div>
  )
}

export const AuthLayout = memo(function AuthLayout({ children, wide = false }) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-[#f6f7fb] dark:bg-[#0b1020] lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#0b1020] lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 subtle-grid opacity-[0.18]" />
        <div className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-indigo-600/30 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-violet-600/25 blur-[110px]" />
        <div className="pointer-events-none absolute right-10 top-24 h-40 w-40 rounded-full bg-emerald-500/10 blur-[70px]" />

        <div className="relative z-10 p-10 xl:p-14">
          <BrandMark light />
        </div>

        <div className="relative z-10 px-10 xl:px-14">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-200">
            <Sparkles className="h-3 w-3" />
            {t('auth.heroBadge')}
          </span>
          <h1 className="mt-5 max-w-lg text-4xl font-extrabold leading-[1.12] tracking-tight text-white xl:text-[2.9rem]">
            {t('auth.heroTitle')}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300/80">
            {t('auth.heroSubtitle')}
          </p>

          <ul className="mt-7 space-y-3">
            {features.map(({ key, icon: Icon }) => (
              <li key={key} className="flex items-center gap-3 text-sm text-slate-200/90">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.08] text-indigo-300">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {t(`auth.features.${key}`)}
              </li>
            ))}
          </ul>

          <div className="mt-9 max-w-sm">
            <PreviewCard />
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between px-10 py-8 text-[11px] text-white/40 xl:px-14">
          <span>© {new Date().getFullYear()} SmartPOS</span>
          <span>{t('auth.frontendDemo')}</span>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-5">
          <div className="lg:invisible">
            <BrandMark />
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-8 sm:px-8">
          <div className={wide ? 'w-full max-w-2xl' : 'w-full max-w-[420px]'}>{children}</div>
        </div>

        <div className="px-4 pb-5 text-center text-[11px] text-slate-400 dark:text-slate-500">
          {t('auth.demoDisclaimer')}
        </div>
      </main>
    </div>
  )
})
