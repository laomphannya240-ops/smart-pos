let counter = 0

export function uid(prefix = 'id') {
  counter = (counter + 1) % 100000
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`
}

export function reference(prefix, existing = []) {
  const numbers = existing
    .map((item) => {
      const match = String(item.number || '').match(/(\d+)$/)
      return match ? Number(match[1]) : 0
    })
    .filter((n) => Number.isFinite(n))
  const max = numbers.length ? Math.max(...numbers) : 1000
  return `${prefix}-${max + 1}`
}
