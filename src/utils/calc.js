import { round } from './format'

export function calculateTotals(items = [], { discount = 0, taxRate = 0 } = {}) {
  const subtotal = round(
    items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0),
  )
  const safeDiscount = round(Math.min(Math.max(Number(discount) || 0, 0), subtotal))
  const cost = round(
    items.reduce((sum, item) => sum + Number(item.cost || 0) * Number(item.qty || 0), 0),
  )
  const taxable = round(subtotal - safeDiscount)
  const tax = round((taxable * (Number(taxRate) || 0)) / 100)
  const total = round(taxable + tax)
  const profit = round(taxable - cost)
  const itemCount = items.reduce((sum, item) => sum + Number(item.qty || 0), 0)

  return {
    subtotal,
    discount: safeDiscount,
    tax,
    total,
    cost,
    profit,
    itemCount,
  }
}
