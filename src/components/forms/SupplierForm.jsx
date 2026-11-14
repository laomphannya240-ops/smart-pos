import { useEffect, useId } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Building2, Mail, MapPin, Phone, Truck, User } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Input, Select, Textarea } from '../ui/Input'
import { Button } from '../ui/Button'
import { useDataStore } from '../../store/useDataStore'

export function SupplierFormModal({ open, onClose, supplier = null }) {
  const { t } = useTranslation()
  const formId = useId()
  const suppliers = useDataStore((state) => state.suppliers)
  const addSupplier = useDataStore((state) => state.addSupplier)
  const updateSupplier = useDataStore((state) => state.updateSupplier)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    if (!open) return
    reset({
      name: supplier?.name || '',
      contactName: supplier?.contactName || '',
      phone: supplier?.phone || '',
      email: supplier?.email || '',
      address: supplier?.address || '',
      status: supplier?.status || 'active',
    })
  }, [open, supplier, reset])

  function onSubmit(values) {
    const duplicate = suppliers.find(
      (entry) =>
        entry.id !== supplier?.id &&
        entry.name.trim().toLowerCase() === values.name.trim().toLowerCase(),
    )
    if (duplicate) {
      toast.error(t('suppliers.duplicateName'))
      return
    }
    if (supplier) {
      updateSupplier(supplier.id, values)
      toast.success(t('suppliers.updated'))
    } else {
      addSupplier(values)
      toast.success(t('suppliers.created'))
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={supplier ? t('suppliers.editSupplier') : t('suppliers.addSupplier')}
      description={t('suppliers.formHint')}
      icon={Truck}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={formId} loading={isSubmitting}>
            {supplier ? t('common.saveChanges') : t('suppliers.addSupplier')}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Input
          label={t('suppliers.companyName')}
          placeholder={t('suppliers.companyPlaceholder')}
          icon={Building2}
          required
          containerClassName="sm:col-span-2"
          error={errors.name?.message}
          {...register('name', { required: t('validation.nameRequired') })}
        />
        <Input
          label={t('suppliers.contactPerson')}
          placeholder={t('suppliers.contactPlaceholder')}
          icon={User}
          required
          error={errors.contactName?.message}
          {...register('contactName', { required: t('validation.nameRequired') })}
        />
        <Input
          label={t('common.phone')}
          placeholder="+855 23 000 000"
          icon={Phone}
          required
          error={errors.phone?.message}
          {...register('phone', {
            required: t('validation.phoneRequired'),
            pattern: {
              value: /^[+()\d\s-]{7,20}$/,
              message: t('validation.phoneInvalid'),
            },
          })}
        />
        <Input
          label={t('common.email')}
          type="email"
          placeholder="orders@supplier.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email', {
            pattern: {
              value: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t('validation.emailInvalid'),
            },
          })}
        />
        <Select label={t('common.status')} {...register('status')}>
          <option value="active">{t('common.active')}</option>
          <option value="inactive">{t('common.inactive')}</option>
        </Select>
        <Textarea
          label={t('common.address')}
          placeholder={t('suppliers.addressPlaceholder')}
          icon={MapPin}
          containerClassName="sm:col-span-2"
          rows={2}
          {...register('address')}
        />
      </form>
    </Modal>
  )
}
