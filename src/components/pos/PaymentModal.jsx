import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  QrCode,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { DemoQRCode } from './DemoQRCode'
import { useCurrency } from '../../hooks/useCurrency'
import { cn } from '../../utils/cn'

const methods = [
  { key: 'cash', icon: Banknote, tone: 'emerald' },
  { key: 'qr', icon: QrCode, tone: 'indigo' },
  { key: 'card', icon: CreditCard, tone: 'violet' },
]

const toneStyles = {
  emerald: {
    active: 'border-emerald-400 bg-emerald-50/70 dark:border-emerald-500/60 dark:bg-emerald-500/10',
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300',
  },
  indigo: {
    active: 'border-indigo-400 bg-indigo-50/70 dark:border-indigo-500/60 dark:bg-indigo-500/10',
    icon: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300',
  },
  violet: {
    active: 'border-violet-400 bg-violet-50/70 dark:border-violet-500/60 dark:bg-violet-500/10',
    icon: 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300',
  },
}

export function PaymentModal({ open, onClose, total, itemCount, onComplete }) {
  const { t } = useTranslation()
  const money = useCurrency()
  const [method, setMethod] = useState('cash')
  const [cashReceived, setCashReceived] = useState('')
  const [processing, setProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')

  useEffect(() => {
    if (!open) return
    setMethod('cash')
    setCashReceived(String(total))
    setProcessing(false)
    setCardNumber('')
    setCardName('')
    setCardExpiry('')
    setCardCvc('')
  }, [open, total])

  const received = Number(cashReceived) || 0
  const change = Math.max(0, received - total)
  const cashInsufficient = method === 'cash' && received < total

  const quickAmounts = [
    Math.ceil(total),
    Math.ceil(total / 5) * 5,
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 20) * 20,
  ]
    .filter((value, index, list) => list.indexOf(value) === index)
    .slice(0, 4)

  function handleConfirm() {
    if (cashInsufficient) {
      toast.error(t('pos.cashInsufficient'))
      return
    }
    if (method === 'card' && cardNumber.replace(/\s/g, '').length < 12) {
      toast.error(t('pos.cardNumberInvalid'))
      return
    }
    setProcessing(true)
    // Simulated payment gateway delay — frontend demo only.
    setTimeout(() => {
      setProcessing(false)
      onComplete({
        paymentMethod: method,
        cashReceived: method === 'cash' ? received : total,
      })
    }, 650)
  }

  const methodLabel = {
    cash: t('payment.cash'),
    qr: t('payment.qr'),
    card: t('payment.card'),
  }

  return (
    <Modal
      open={open}
      onClose={processing ? undefined : onClose}
      closeOnBackdrop={!processing}
      size="lg"
      title={t('pos.completePayment')}
      description={t('pos.paymentSubtitle', { count: itemCount, total: money(total) })}
      icon={Wallet}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <p className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('pos.demoPaymentNote')}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={processing}>
              {t('common.cancel')}
            </Button>
            <Button
              variant={method === 'cash' ? 'success' : 'primary'}
              onClick={handleConfirm}
              loading={processing}
              leftIcon={CheckCircle2}
            >
              {method === 'cash' ? t('pos.confirmCashPayment') : t('pos.confirmPayment')}
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('pos.selectPaymentMethod')}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {methods.map(({ key, icon: Icon, tone }) => {
              const active = method === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMethod(key)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-xs font-semibold transition-all',
                    active
                      ? toneStyles[tone].active
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg',
                      active
                        ? toneStyles[tone].icon
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800',
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  {methodLabel[key]}
                  {key === 'qr' && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                      {t('common.demo')}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-4">
            {method === 'cash' && (
              <div className="space-y-3">
                <Input
                  label={t('pos.cashReceived')}
                  type="number"
                  min={0}
                  step="0.01"
                  value={cashReceived}
                  onChange={(event) => setCashReceived(event.target.value)}
                  placeholder="0.00"
                  icon={Banknote}
                />
                <div className="flex flex-wrap gap-1.5">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setCashReceived(String(amount))}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500/50"
                    >
                      {money(amount)}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      {t('pos.cashReceivedShort')}
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-white">
                      {money(received)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      {t('pos.change')}
                    </p>
                    <p
                      className={cn(
                        'mt-0.5 text-sm font-bold',
                        cashInsufficient
                          ? 'text-rose-500'
                          : 'text-emerald-600 dark:text-emerald-400',
                      )}
                    >
                      {money(change)}
                    </p>
                  </div>
                </div>
                {cashInsufficient && (
                  <p className="text-[11px] font-medium text-rose-500">
                    {t('pos.cashShort', { amount: money(total - received) })}
                  </p>
                )}
              </div>
            )}

            {method === 'qr' && (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-500/30 dark:bg-indigo-500/5">
                <DemoQRCode value={`SMARTPOS-${total}-${Date.now().toString().slice(-6)}`} size={170} />
                <div className="mt-3 text-center">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {t('pos.scanQr')}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {t('pos.qrAmount', { amount: money(total) })}
                  </p>
                </div>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Smartphone className="h-3 w-3" />
                  {t('pos.qrWaiting')}
                </span>
              </div>
            )}

            {method === 'card' && (
              <div className="space-y-3">
                <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <CreditCard className="h-5 w-5 text-white/60" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                      {t('common.demoCard')}
                    </span>
                  </div>
                  <p className="mt-4 font-mono text-sm tracking-[0.18em]">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[9px] uppercase tracking-wider text-white/50">
                    <span>{cardName || t('pos.cardHolder')}</span>
                    <span>{cardExpiry || 'MM/YY'}</span>
                  </div>
                </div>
                <Input
                  label={t('pos.cardNumber')}
                  value={cardNumber}
                  onChange={(event) =>
                    setCardNumber(
                      event.target.value
                        .replace(/[^\d]/g, '')
                        .slice(0, 16)
                        .replace(/(.{4})/g, '$1 ')
                        .trim(),
                    )
                  }
                  placeholder="4242 4242 4242 4242"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label={t('pos.cardName')}
                    value={cardName}
                    onChange={(event) => setCardName(event.target.value)}
                    placeholder="ALEX MORGAN"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label={t('pos.expiry')}
                      value={cardExpiry}
                      onChange={(event) => {
                        const digits = event.target.value.replace(/[^\d]/g, '').slice(0, 4)
                        setCardExpiry(
                          digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits,
                        )
                      }}
                      placeholder="MM/YY"
                    />
                    <Input
                      label={t('pos.cvc')}
                      value={cardCvc}
                      onChange={(event) =>
                        setCardCvc(event.target.value.replace(/[^\d]/g, '').slice(0, 4))
                      }
                      placeholder="123"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">{t('pos.cardDemoNote')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
            {t('pos.orderSummary')}
          </p>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>{t('pos.itemsInOrder')}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{itemCount}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>{t('common.subtotal')}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{money(total)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>{t('pos.paymentMethod')}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {methodLabel[method]}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between border-t border-dashed border-slate-300 pt-3 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('pos.amountDue')}
            </span>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {money(total)}
            </span>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-white p-3 text-[10px] leading-relaxed text-slate-400 dark:bg-slate-900 dark:text-slate-500">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            {t('pos.paymentSecurityNote')}
          </div>
        </div>
      </div>
    </Modal>
  )
}
