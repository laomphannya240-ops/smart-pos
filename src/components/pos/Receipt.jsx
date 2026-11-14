import { useTranslation } from 'react-i18next'
import { Store } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useCurrency } from '../../hooks/useCurrency'
import { formatDate, formatTime } from '../../utils/format'

export function Receipt({ sale }) {
  const { t } = useTranslation()
  const money = useCurrency()
  const settings = useAppStore((state) => state.settings)

  if (!sale) return null

  return (
    <div className="print-area mx-auto w-full max-w-[360px] bg-white px-5 py-6 text-slate-900 shadow-sm print:max-w-full print:shadow-none">
      <div className="flex flex-col items-center text-center">
        {settings.showLogo &&
          (settings.logoImage ? (
            <img
              src={settings.logoImage}
              alt={settings.storeName}
              className="h-12 w-12 rounded-xl object-cover"
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
              {settings.logo ? (
                <span className="text-2xl leading-none">{settings.logo}</span>
              ) : (
                <Store className="h-5 w-5" />
              )}
            </span>
          ))}
        <h2 className="mt-2 text-lg font-extrabold tracking-tight">{settings.storeName}</h2>
        <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">{settings.address}</p>
        <p className="text-[10px] text-slate-500">
          {settings.phone} · {settings.email}
        </p>
      </div>

      <div className="my-4 border-t border-dashed border-slate-300" />

      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span className="text-slate-500">{t('receipt.receiptNo')}</span>
          <span className="font-bold">{sale.number}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">{t('receipt.date')}</span>
          <span>
            {formatDate(sale.createdAt)} · {formatTime(sale.createdAt)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">{t('receipt.cashier')}</span>
          <span>{sale.cashierName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">{t('receipt.customer')}</span>
          <span className="max-w-[60%] truncate text-right">{sale.customerName}</span>
        </div>
      </div>

      <div className="my-3 border-t border-dashed border-slate-300" />

      <table className="w-full text-[10px]">
        <thead>
          <tr className="text-slate-500">
            <th className="pb-1.5 text-left font-semibold uppercase tracking-wide">
              {t('receipt.item')}
            </th>
            <th className="pb-1.5 text-center font-semibold uppercase tracking-wide">
              {t('receipt.qty')}
            </th>
            <th className="pb-1.5 text-right font-semibold uppercase tracking-wide">
              {t('receipt.price')}
            </th>
            <th className="pb-1.5 text-right font-semibold uppercase tracking-wide">
              {t('receipt.amount')}
            </th>
          </tr>
        </thead>
        <tbody>
          {(sale.items || []).map((item, index) => (
            <tr key={`${item.productId}-${index}`} className="align-top">
              <td className="py-1 pr-1.5">
                <span className="line-clamp-2 font-medium">
                  {item.emoji ? `${item.emoji} ` : ''}
                  {item.name}
                </span>
              </td>
              <td className="py-1 text-center">{item.qty}</td>
              <td className="py-1 text-right tabular-nums">{money(item.price)}</td>
              <td className="py-1 text-right font-semibold tabular-nums">
                {money(item.price * item.qty)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="my-3 border-t border-dashed border-slate-300" />

      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span className="text-slate-500">{t('receipt.subtotal')}</span>
          <span className="tabular-nums">{money(sale.subtotal)}</span>
        </div>
        {Number(sale.discount) > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>{t('receipt.discount')}</span>
            <span className="tabular-nums">−{money(sale.discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-500">
            {t('receipt.tax')} ({sale.taxRate ?? 0}%)
          </span>
          <span className="tabular-nums">{money(sale.tax)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between border-t border-slate-300 pt-2 text-sm font-extrabold">
          <span>{t('receipt.total')}</span>
          <span className="tabular-nums">{money(sale.total)}</span>
        </div>
      </div>

      <div className="my-3 border-t border-dashed border-slate-300" />

      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span className="text-slate-500">{t('receipt.paidVia')}</span>
          <span className="font-semibold uppercase">{t(`payment.${sale.paymentMethod}`)}</span>
        </div>
        {sale.paymentMethod === 'cash' && (
          <>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('receipt.cashReceived')}</span>
              <span className="tabular-nums">{money(sale.cashReceived)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('receipt.change')}</span>
              <span className="tabular-nums">{money(sale.change)}</span>
            </div>
          </>
        )}
      </div>

      <div className="my-4 border-t border-dashed border-slate-300" />

      <div className="text-center">
        <p className="text-[11px] font-semibold">{settings.receiptFooter}</p>
        <p className="mt-1 text-[9px] leading-relaxed text-slate-500">{settings.receiptNote}</p>
      </div>

      <div className="mt-4 flex flex-col items-center">
        <div
          className="h-8 w-40"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, #0f172a 0 1px, transparent 1px 3px, #0f172a 3px 5px, transparent 5px 7px)',
          }}
        />
        <p className="mt-1 font-mono text-[9px] tracking-[0.2em] text-slate-500">{sale.number}</p>
      </div>

      <p className="mt-3 text-center text-[8px] uppercase tracking-[0.18em] text-slate-400">
        {t('receipt.demoNote')}
      </p>
    </div>
  )
}
