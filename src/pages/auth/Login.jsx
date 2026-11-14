import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  AlertCircle,
  ArrowRight,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ScanLine,
  ShieldCheck,
  UserCog,
} from 'lucide-react'
import { AuthLayout } from '../../layouts/AuthLayout'
import { Input, Checkbox } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../store/useAppStore'
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../../data/demoData'
import { homePathForRole } from '../../utils/permissions'

const roleIcons = { admin: ShieldCheck, manager: UserCog, cashier: ScanLine }

export function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const login = useAppStore((state) => state.login)
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '', password: '', remember: true },
  })

  function onSubmit(values) {
    setSubmitting(true)
    setAuthError('')
    try {
      const session = login(values.email, values.password, values.remember)
      toast.success(t('auth.welcomeUser', { name: session.name.split(' ')[0] }))
      navigate(homePathForRole(session.role), { replace: true })
    } catch (error) {
      const key =
        error?.code === 'inactive_account'
          ? 'auth.errors.inactiveAccount'
          : 'auth.errors.invalidCredentials'
      setAuthError(t(key))
      toast.error(t(key))
    } finally {
      setSubmitting(false)
    }
  }

  function fillDemo(account) {
    setValue('email', account.email, { shouldValidate: true })
    setValue('password', DEMO_PASSWORD, { shouldValidate: true })
    clearErrors()
    setAuthError('')
  }

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(DEMO_PASSWORD)
      toast.success(t('auth.passwordCopied'))
    } catch {
      toast.error(t('auth.copyFailed'))
    }
  }

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_20px_60px_-30px_rgb(15_23_42_/_0.35)] dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mb-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <KeyRound className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('auth.signInTitle')}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {t('auth.signInSubtitle')}
          </p>
        </div>

        {authError && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label={t('auth.email')}
            type="email"
            autoComplete="email"
            placeholder="you@smartpos.com"
            icon={Mail}
            error={errors.email?.message}
            {...register('email', {
              required: t('validation.emailRequired'),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t('validation.emailInvalid'),
              },
            })}
          />

          <Input
            label={t('auth.password')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label={t(showPassword ? 'auth.hidePassword' : 'auth.showPassword')}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register('password', {
              required: t('validation.passwordRequired'),
              minLength: { value: 6, message: t('validation.passwordMin') },
            })}
          />

          <div className="flex items-center justify-between gap-3">
            <Checkbox label={t('auth.rememberMe')} {...register('remember')} />
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={submitting}
            rightIcon={ArrowRight}
          >
            {t('auth.signIn')}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:bg-slate-900 dark:text-slate-500">
              {t('auth.demoAccess')}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {DEMO_ACCOUNTS.map((account) => {
            const Icon = roleIcons[account.role]
            return (
              <button
                key={account.role}
                type="button"
                onClick={() => fillDemo(account)}
                className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-left transition hover:border-indigo-300 hover:bg-indigo-50/60 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/10"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {t(`role.${account.role}`)}
                  </span>
                  <span className="block truncate text-[11px] text-slate-400 dark:text-slate-500">
                    {account.email}
                  </span>
                </span>
                <span className="hidden text-[10px] font-semibold text-indigo-600 opacity-0 transition group-hover:opacity-100 dark:text-indigo-400 sm:block">
                  {t('auth.useAccount')}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/50">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {t('auth.demoPassword')}: <span className="font-semibold text-slate-700 dark:text-slate-200">{DEMO_PASSWORD}</span>
          </p>
          <button
            type="button"
            onClick={copyPassword}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
          >
            <Copy className="h-3 w-3" />
            {t('common.copy')}
          </button>
        </div>

        <p className="mt-4 text-center text-[10px] leading-relaxed text-slate-400 dark:text-slate-500">
          {t('auth.frontendOnly')}
        </p>
      </div>

      <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
        {t('auth.needHelp')}{' '}
        <a
          href="mailto:support@smartpos.com"
          className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          {t('auth.contactSupport')}
        </a>
      </p>
    </AuthLayout>
  )
}
