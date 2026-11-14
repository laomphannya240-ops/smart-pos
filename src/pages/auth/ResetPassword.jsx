import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react'
import { AuthLayout } from '../../layouts/AuthLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export function ResetPassword() {
  const { t } = useTranslation()
  const [done, setDone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { password: '', confirmPassword: '' } })

  const password = watch('password')

  function onSubmit() {
    setSubmitting(true)
    // Demo-only simulated password update.
    setTimeout(() => {
      setSubmitting(false)
      setDone(true)
    }, 700)
  }

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((value) => !value)}
      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
      aria-label={t(showPassword ? 'auth.hidePassword' : 'auth.showPassword')}
    >
      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_20px_60px_-30px_rgb(15_23_42_/_0.35)] dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {done ? (
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('auth.passwordUpdated')}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {t('auth.passwordUpdatedSubtitle')}
            </p>
            <div className="mt-6 flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 px-3.5 py-3 text-xs leading-relaxed text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              {t('auth.demoResetNote')}
            </div>
            <Link to="/login">
              <Button size="lg" className="mt-6 w-full">
                {t('auth.backToSignIn')}
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Lock className="h-5 w-5" />
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('auth.resetTitle')}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {t('auth.resetSubtitle')}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
              <Input
                label={t('auth.newPassword')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                icon={Lock}
                trailing={passwordToggle}
                error={errors.password?.message}
                {...register('password', {
                  required: t('validation.passwordRequired'),
                  minLength: { value: 8, message: t('validation.passwordMin8') },
                })}
              />
              <Input
                label={t('auth.confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                icon={Lock}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: t('validation.confirmPasswordRequired'),
                  validate: (value) =>
                    value === password || t('validation.passwordsMismatch'),
                })}
              />

              <ul className="space-y-1.5 rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-slate-800/50">
                {[
                  t('auth.passwordRuleLength'),
                  t('auth.passwordRuleMatch'),
                  t('auth.passwordRuleUnique'),
                ].map((rule) => (
                  <li
                    key={rule}
                    className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    {rule}
                  </li>
                ))}
              </ul>

              <Button type="submit" size="lg" className="w-full" loading={submitting}>
                {t('auth.updatePassword')}
              </Button>
            </form>

            <Link
              to="/login"
              className="mt-5 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('auth.backToSignIn')}
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
