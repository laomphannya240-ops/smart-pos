import { AlertTriangle, HelpCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import { Button } from './Button'

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = 'danger',
  loading = false,
}) {
  const { t } = useTranslation()
  const danger = tone === 'danger'

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title || t('common.confirm')}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel || t('common.cancel')}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel || t('common.confirm')}
          </Button>
        </div>
      }
    >
      <div className="flex gap-4">
        <span
          className={
            danger
              ? 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
              : 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300'
          }
        >
          {danger ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <HelpCircle className="h-5 w-5" />
          )}
        </span>
        <p className="pt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {description || t('common.confirmDescription')}
        </p>
      </div>
    </Modal>
  )
}
