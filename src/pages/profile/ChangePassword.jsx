import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAppStore } from '../../store/useAppStore'
import { cn } from '../../utils/cn'

function scorePassword(value) {
  if (!value) return 0
  let score = 0
  if (value.length >= 8) score += 1
  if (value.length >= 12) score += 1
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1
  if (/\d/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1
  return Math.min(score, 4)
}

const strengthMeta = [
  { key: 'empty', tone: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-400' },
  { key: 'weak', tone: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' },
  { key: 'fair', tone: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  { key: 'good', tone: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400' },
  { key: 'strong', tone: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
]

function VisibilityToggle({ visible, onToggle, label }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
    >
      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )
}

export function ChangePassword() {
  const { t } = useTranslation()
  const changePassword = useAppStore((state) => state.changePassword)
  const [show, setShow] = useState({ current: false, next: false, confirm: false })
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const currentPassword = watch('currentPassword')
  const newPassword = watch('newPassword')
  const confirmPassword = watch('confirmPassword')

  const strength = useMemo(() => scorePassword(newPassword), [newPassword])
  const strengthInfo = strengthMeta[strength]

  const checks = useMemo(
    () => [
      { key: 'length', passed: newPassword.length >= 8 },
      { key: 'mixedCase', passed: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) },
      { key: 'number', passed: /\d/.test(newPassword) },
      { key: 'symbol', passed: /[^A-Za-z0-9]/.test(newPassword) },
      {
        key: 'different',
        passed: Boolean(newPassword) && newPassword !== currentPassword,
      },
      {
        key: 'match',
        passed: Boolean(confirmPassword) && newPassword === confirmPassword,
      },
    ],
    [newPassword, currentPassword, confirmPassword],
  )

  function toggle(field) {
    setShow((value) => ({ ...value, [field]: !value[field] }))
  }

  function onSubmit(values) {
    try {
      changePassword(values.currentPassword, values.newPassword)
      toast.success(t('changePassword.updated'))
      reset({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSubmitted(true)
    } catch (error) {
      const key =
        error?.code === 'invalid_password'
          ? 'changePassword.currentInvalid'
          : 'changePassword.sessionExpired'
      toast.error(t(key))
      setSubmitted(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('changePassword.title')}
        description={t('changePassword.subtitle')}
        actions={
          <Link to="/profile">
            <Button variant="outline" leftIcon={ArrowLeft}>
              {t('changePassword.backToProfile')}
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader
            title={t('changePassword.formTitle')}
            subtitle={t('changePassword.formHint')}
            icon={KeyRound}
          />
          <CardBody>
            {submitted && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-3 text-xs leading-relaxed text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{t('changePassword.updatedHint')}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label={t('changePassword.currentPassword')}
                type={show.current ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                icon={Lock}
                required
                error={errors.currentPassword?.message}
                trailing={
                  <VisibilityToggle
                    visible={show.current}
                    onToggle={() => toggle('current')}
                    label={t(
                      show.current ? 'auth.hidePassword' : 'auth.showPassword',
                    )}
                  />
                }
                {...register('currentPassword', {
                  required: t('validation.passwordRequired'),
                })}
              />

              <Input
                label={t('changePassword.newPassword')}
                type={show.next ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                icon={KeyRound}
                required
                hint={t('changePassword.newPasswordHint')}
                error={errors.newPassword?.message}
                trailing={
                  <VisibilityToggle
                    visible={show.next}
                    onToggle={() => toggle('next')}
                    label={t(show.next ? 'auth.hidePassword' : 'auth.showPassword')}
                  />
                }
                {...register('newPassword', {
                  required: t('validation.passwordRequired'),
                  minLength: { value: 8, message: t('validation.passwordMin8') },
                  validate: (value) =>
                    value !== currentPassword || t('changePassword.samePassword'),
                })}
              />

              {newPassword && (
                <div className="space-y-2 rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {t('changePassword.strength')}
                    </span>
                    <span className={cn('text-[11px] font-bold', strengthInfo.text)}>
                      {t(`changePassword.strengthLevels.${strengthInfo.key}`)}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <span
                        key={level}
                        className={cn(
                          'h-1.5 flex-1 rounded-full transition-colors',
                          level <= strength
                            ? strengthInfo.tone
                            : 'bg-slate-200 dark:bg-slate-700',
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}

              <Input
                label={t('changePassword.confirmPassword')}
                type={show.confirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                icon={ShieldCheck}
                required
                error={errors.confirmPassword?.message}
                trailing={
                  <VisibilityToggle
                    visible={show.confirm}
                    onToggle={() => toggle('confirm')}
                    label={t(
                      show.confirm ? 'auth.hidePassword' : 'auth.showPassword',
                    )}
                  />
                }
                {...register('confirmPassword', {
                  required: t('validation.confirmPasswordRequired'),
                  validate: (value) =>
                    value === newPassword || t('validation.passwordsMismatch'),
                })}
              />

              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() =>
                    reset({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  }
                  disabled={isSubmitting}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" leftIcon={KeyRound} loading={isSubmitting}>
                  {t('changePassword.updatePassword')}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title={t('changePassword.requirements')}
              subtitle={t('changePassword.requirementsHint')}
              icon={ShieldCheck}
            />
            <CardBody>
              <ul className="space-y-2.5">
                {checks.map((check) => (
                  <li key={check.key} className="flex items-start gap-2.5">
                    {check.passed ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />
                    )}
                    <span
                      className={cn(
                        'text-xs leading-relaxed',
                        check.passed
                          ? 'text-slate-600 dark:text-slate-300'
                          : 'text-slate-400 dark:text-slate-500',
                      )}
                    >
                      {t(`changePassword.checks.${check.key}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={t('changePassword.securityTitle')}
              subtitle={t('changePassword.securityHint')}
              icon={Lock}
            />
            <CardBody className="space-y-2.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              <p>{t('changePassword.tip1')}</p>
              <p>{t('changePassword.tip2')}</p>
              <p>{t('changePassword.tip3')}</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
