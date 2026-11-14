const dayMs = 24 * 60 * 60 * 1000

export const DASHBOARD_RANGES = ['today', 'yesterday', 'last7', 'last30', 'thisMonth']

export const REPORT_RANGES = ['last7', 'last30', 'thisMonth', 'last90', 'thisYear']

export function startOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function resolveRange(range, now = new Date()) {
  const start = startOfDay(now)
  const end = endOfDay(now)

  switch (range) {
    case 'yesterday':
      start.setDate(start.getDate() - 1)
      end.setDate(end.getDate() - 1)
      break
    case 'last7':
      start.setDate(start.getDate() - 6)
      break
    case 'last30':
      start.setDate(start.getDate() - 29)
      break
    case 'thisMonth':
      start.setDate(1)
      break
    case 'last90':
      start.setDate(start.getDate() - 89)
      break
    case 'thisYear':
      start.setMonth(0, 1)
      break
    case 'today':
    default:
      break
  }

  return { start, end, key: range }
}

export function previousRange(range, now = new Date()) {
  const { start, end } = resolveRange(range, now)
  const span = end.getTime() - start.getTime() + 1
  return {
    start: new Date(start.getTime() - span),
    end: new Date(start.getTime() - 1),
    key: `previous-${range}`,
  }
}

export function isWithin(value, { start, end }) {
  if (!value) return false
  const time = new Date(value).getTime()
  return time >= start.getTime() && time <= end.getTime()
}

export function filterByRange(items, range, dateKey = 'createdAt') {
  const resolved = typeof range === 'object' ? range : resolveRange(range)
  return items.filter((item) => isWithin(item[dateKey], resolved))
}

export function completedSales(sales = []) {
  return sales.filter((sale) => sale.status === 'completed')
}

export function getKpis(sales = []) {
  const completed = completedSales(sales)
  const revenue = completed.reduce((sum, sale) => sum + Number(sale.total || 0), 0)
  const profit = completed.reduce((sum, sale) => sum + Number(sale.profit || 0), 0)
  const discount = completed.reduce((sum, sale) => sum + Number(sale.discount || 0), 0)
  const tax = completed.reduce((sum, sale) => sum + Number(sale.tax || 0), 0)
  const items = completed.reduce(
    (sum, sale) =>
      sum + (sale.items || []).reduce((qty, item) => qty + Number(item.qty || 0), 0),
    0,
  )

  return {
    revenue,
    profit,
    discount,
    tax,
    items,
    orders: completed.length,
    averageOrder: completed.length ? revenue / completed.length : 0,
  }
}

export function percentageChange(current, previous) {
  if (!previous) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

function bucketKey(date, granularity) {
  const d = new Date(date)
  if (granularity === 'monthly') {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  if (granularity === 'weekly') {
    const start = startOfDay(d)
    const day = (start.getDay() + 6) % 7
    start.setDate(start.getDate() - day)
    return start.toISOString().slice(0, 10)
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

function bucketLabel(key, granularity) {
  if (granularity === 'monthly') {
    const [year, month] = key.split('-')
    return new Intl.DateTimeFormat('en-GB', { month: 'short', year: '2-digit' }).format(
      new Date(Number(year), Number(month) - 1, 1),
    )
  }
  const date = new Date(`${key}T12:00:00`)
  if (granularity === 'weekly') {
    return `W${new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(date)}`
  }
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(date)
}

export function buildSeries(sales = [], range, granularity = 'daily') {
  const resolved = typeof range === 'object' ? range : resolveRange(range)
  const completed = completedSales(sales).filter((sale) => isWithin(sale.createdAt, resolved))
  const buckets = new Map()

  const stepDays = granularity === 'weekly' ? 7 : 1
  const cursor = startOfDay(resolved.start)

  if (granularity === 'monthly') {
    const monthCursor = new Date(resolved.start.getFullYear(), resolved.start.getMonth(), 1)
    while (monthCursor <= resolved.end) {
      const key = bucketKey(monthCursor, 'monthly')
      buckets.set(key, {
        key,
        name: bucketLabel(key, 'monthly'),
        revenue: 0,
        profit: 0,
        orders: 0,
        items: 0,
      })
      monthCursor.setMonth(monthCursor.getMonth() + 1)
    }
  } else {
    while (cursor <= resolved.end) {
      const key = bucketKey(cursor, granularity)
      if (!buckets.has(key)) {
        buckets.set(key, {
          key,
          name: bucketLabel(key, granularity),
          revenue: 0,
          profit: 0,
          orders: 0,
          items: 0,
        })
      }
      cursor.setDate(cursor.getDate() + stepDays)
    }
  }

  completed.forEach((sale) => {
    const key = bucketKey(sale.createdAt, granularity)
    if (!buckets.has(key)) {
      buckets.set(key, {
        key,
        name: bucketLabel(key, granularity),
        revenue: 0,
        profit: 0,
        orders: 0,
        items: 0,
      })
    }
    const bucket = buckets.get(key)
    bucket.revenue += Number(sale.total || 0)
    bucket.profit += Number(sale.profit || 0)
    bucket.orders += 1
    bucket.items += (sale.items || []).reduce((sum, item) => sum + Number(item.qty || 0), 0)
  })

  return Array.from(buckets.values())
    .sort((a, b) => (a.key > b.key ? 1 : -1))
    .map((bucket) => ({
      ...bucket,
      revenue: Math.round(bucket.revenue * 100) / 100,
      profit: Math.round(bucket.profit * 100) / 100,
    }))
}

export function getPaymentBreakdown(sales = []) {
  const completed = completedSales(sales)
  const map = new Map()
  completed.forEach((sale) => {
    const method = sale.paymentMethod || 'cash'
    const entry = map.get(method) || { method, amount: 0, count: 0 }
    entry.amount += Number(sale.total || 0)
    entry.count += 1
    map.set(method, entry)
  })
  return Array.from(map.values()).sort((a, b) => b.amount - a.amount)
}

export function getTopProducts(sales = [], limit = 5) {
  const completed = completedSales(sales)
  const map = new Map()
  completed.forEach((sale) => {
    ;(sale.items || []).forEach((item) => {
      const entry = map.get(item.productId) || {
        productId: item.productId,
        name: item.name,
        emoji: item.emoji,
        qty: 0,
        revenue: 0,
        profit: 0,
      }
      entry.qty += Number(item.qty || 0)
      entry.revenue += Number(item.qty || 0) * Number(item.price || 0)
      entry.profit +=
        Number(item.qty || 0) * (Number(item.price || 0) - Number(item.cost || 0))
      map.set(item.productId, entry)
    })
  })
  return Array.from(map.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}

export function getCategoryPerformance(sales = [], products = [], categories = []) {
  const productMap = new Map(products.map((product) => [product.id, product]))
  const map = new Map()
  completedSales(sales).forEach((sale) => {
    ;(sale.items || []).forEach((item) => {
      const product = productMap.get(item.productId)
      const category = categories.find((cat) => cat.id === product?.categoryId)
      const key = category?.id || 'uncategorized'
      const entry = map.get(key) || {
        id: key,
        name: category?.name || 'Uncategorized',
        color: category?.color || 'slate',
        qty: 0,
        revenue: 0,
        profit: 0,
      }
      entry.qty += Number(item.qty || 0)
      entry.revenue += Number(item.qty || 0) * Number(item.price || 0)
      entry.profit +=
        Number(item.qty || 0) * (Number(item.price || 0) - Number(item.cost || 0))
      map.set(key, entry)
    })
  })
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
}

export function sumBy(list, key) {
  return list.reduce((sum, item) => sum + Number(item[key] || 0), 0)
}

export function customerStats(sales = [], customerId) {
  const own = completedSales(sales).filter((sale) => sale.customerId === customerId)
  return {
    orders: own.length,
    totalSpent: sumBy(own, 'total'),
    lastPurchase: own[0]?.createdAt || null,
    sales: own,
  }
}

export function dateKeyLocal(value) {
  return bucketKey(value, 'daily')
}

export { dayMs }
