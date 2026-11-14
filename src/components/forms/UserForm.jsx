import { useEffect, useId } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Mail, Phone, ShieldCheck, User, UserCog } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Input, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { useDataStore } from '../../store/useDataStore'
import { useAppStore } from '../../store/useAppStore'

export function UserFormModal({ open, onClose, user = null }) {
  const { t } = useTranslation()
  const formId = useId()
  const users = useDataStore((state) => state.users)
  const addUser = useDataStore((state) => state.addUser)
  const updateUser = useDataStore((state) => state.updateUser)
  const session = useAppStore((state) => state.session)
  const isSelf = user?.id === session?.id

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    if (!open) return
    reset({
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'cashier',
      phone: user?.phone || '',
      status: user?.status || 'active',
    })
  }, [open, user, reset])

  function onSubmit(values) {
    const duplicate = users.find(
      (entry) =>
        entry.id !== user?.id &&
        entry.email.toLowerCase() === values.email.trim().toLowerCase(),
    )
    if (duplicate) {
      toast.error(t('users.duplicateEmail'))
      return
    }
    const payload = { ...values, email: values.email.trim().toLowerCase() }
    if (user) {
      updateUser(user.id, payload)
      toast.success(t('users.updated'))
    } else {
      addUser(payload)
      toast.success(t('users.created'))
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={user ? t('users.editUser') : t('users.addUser')}
      description={t('users.formHint')}
      icon={UserCog}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={formId} loading={isSubmitting}>
            {user ? t('common.saveChanges') : t('users.addUser')}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Input
          label={t('common.fullName')}
          placeholder={t('users.namePlaceholder')}
          icon={User}
          required
          error={errors.name?.message}
          {...register('name', { required: t('validation.nameRequired') })}
        />
        <Input
          label={t('common.email')}
          type="email"
          placeholder="user@smartpos.com"
          icon={Mail}
          required
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
          label={t('common.phone')}
          placeholder="+855 12 000 000"
          icon={Phone}
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Select
          label={t('users.role')}
          required
          disabled={isSelf}
          hint={isSelf ? t('users.cannotChangeOwnRole') : undefined}
          {...register('role', { required: t('validation.roleRequired') })}
        >
          <option value="admin">{t('role.admin')}</option>
          <option value="manager">{t('role.manager')}</option>
          <option value="cashier">{t('role.cashier')}</option>
        </Select>
        <Select
          label={t('common.status')}
          disabled={isSelf}
          hint={isSelf ? t('users.cannotDeactivateSelf') : undefined}
          {...register('status')}
        >
          <option value="active">{t('common.active')}</option>
          <option value="inactive">{t('common.inactive')}</option>
        </Select>

        <div className="flex items-start gap-2 rounded-xl bg-indigo-50/70 px-3.5 py-3 text-[11px] leading-relaxed text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 sm:col-span-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          {t('users.demoPasswordNote')}
        </div>
      </form>
    </Modal>
  )
}
