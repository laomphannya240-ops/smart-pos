import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, CheckCircle2, Mail, MailCheck, ShieldCheck } from 'lucide-react'
import { AuthLayout } from '../../layouts/AuthLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export function ForgotPassword() {
  const { t } = useTranslation()
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '' } })

  function onSubmit(values) {
    setSubmitting(true)
    // Demo-only simulated request — no backend is connected.
    setTimeout(() => {
      setEmail(values.email)
      setSent(true)
      setSubmitting(false)
    }, 700)
  }

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_20px_60px_-30px_rgb(15_23_42_/_0.35)] dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {sent ? (
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <MailCheck className="h-6 w-6" />
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('auth.checkInbox')}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {t('auth.resetSentTo', { email })}
            </p>

            <div className="mt-5 flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 px-3.5 py-3 text-xs leading-relaxed text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              {t('auth.demoResetNote')}
            </div>

            <div className="mt-6 space-y-2">
              <Link to="/reset-password">
                <Button size="lg" className="w-full" leftIcon={CheckCircle2}>
                  {t('auth.openResetPage')}
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {t('auth.resendEmail')}
              </button>
            </div>

            <Link
              to="/login"
              className="mt-5 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('auth.backToSignIn')}
            </Link>
          </div>
        ) : (
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Mail className="h-5 w-5" />
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('auth.forgotTitle')}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {t('auth.forgotSubtitle')}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
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
              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={submitting}
                rightIcon={ArrowLeft}
              >
                {t('auth.sendResetLink')}
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
