export const KHR_RATE = 4100

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const khrFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'KHR',
  maximumFractionDigits: 0,
})

export function formatCurrency(value, currency = 'USD') {
  const amount = Number(value) || 0
  if (currency === 'KHR') {
    return khrFormatter.format(Math.round(amount * KHR_RATE))
  }
  return usdFormatter.format(amount)
}

export function formatCompactCurrency(value, currency = 'USD') {
  const amount = Number(value) || 0
  if (currency === 'KHR') return formatCurrency(amount, 'KHR')
  if (Math.abs(amount) >= 1000) {
    return `$${new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)}`
  }
  return usdFormatter.format(amount)
}

export function formatNumber(value, options = {}) {
  return new Intl.NumberFormat('en-US', options).format(Number(value) || 0)
}

export function formatPercent(value, digits = 1) {
  const num = Number(value) || 0
  return `${num > 0 ? '+' : ''}${num.toFixed(digits)}%`
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
})

const weekdayFormatter = new Intl.DateTimeFormat('en-GB', { weekday: 'short' })

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return dateFormatter.format(date)
}

export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return dateTimeFormatter.format(date)
}

export function formatTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return timeFormatter.format(date)
}

export function formatWeekday(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return weekdayFormatter.format(date)
}

export function formatRelative(value) {
  if (!value) return '—'
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(value)
}

export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

export function round(value, digits = 2) {
  const factor = 10 ** digits
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor
}
