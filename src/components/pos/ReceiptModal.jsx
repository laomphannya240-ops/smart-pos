import { useTranslation } from 'react-i18next'
import { Printer, ReceiptText } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Receipt } from './Receipt'

export function ReceiptModal({ open, onClose, sale, onNewSale }) {
  const { t } = useTranslation()

  function handlePrint() {
    window.print()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={t('receipt.title')}
      description={t('receipt.subtitle')}
      icon={ReceiptText}
      bodyClassName="bg-slate-100/70 dark:bg-slate-950/60"
      footer={
        <div className="flex justify-between gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('common.close')}
          </Button>
          <div className="flex gap-2">
            {onNewSale && (
              <Button variant="secondary" onClick={onNewSale}>
                {t('pos.newSale')}
              </Button>
            )}
            <Button leftIcon={Printer} onClick={handlePrint}>
              {t('common.printReceipt')}
            </Button>
          </div>
        </div>
      }
    >
      <Receipt sale={sale} />
    </Modal>
  )
}
