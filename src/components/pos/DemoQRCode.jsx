import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../utils/cn'

function seededRandom(seed) {
  let a = seed >>> 0
  return function random() {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildMatrix(value, size = 25) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  const random = seededRandom(hash)
  const matrix = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => random() > 0.54),
  )

  function setCell(row, col, dark) {
    if (row >= 0 && row < size && col >= 0 && col < size) matrix[row][col] = dark
  }

  function finder(row, col) {
    for (let r = -1; r <= 7; r += 1) {
      for (let c = -1; c <= 7; c += 1) {
        const inOuter = r >= 0 && r <= 6 && c >= 0 && c <= 6
        const border = r === 0 || r === 6 || c === 0 || c === 6
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4
        setCell(row + r, col + c, inOuter && (border || core))
      }
    }
  }

  finder(0, 0)
  finder(0, size - 7)
  finder(size - 7, 0)

  for (let i = 8; i < size - 8; i += 1) {
    setCell(6, i, i % 2 === 0)
    setCell(i, 6, i % 2 === 0)
  }

  return matrix
}

export function DemoQRCode({ value = 'SMARTPOS-DEMO-PAYMENT', size = 180, className }) {
  const { t } = useTranslation()
  const matrix = useMemo(() => buildMatrix(value), [value])
  const cells = []

  matrix.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell) {
        cells.push(
          <rect
            key={`${rowIndex}-${colIndex}`}
            x={colIndex}
            y={rowIndex}
            width={1}
            height={1}
            fill="#0f172a"
          />,
        )
      }
    })
  })

  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white p-3 shadow-sm', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 25 25"
        role="img"
        aria-label={t('common.demoQrCode')}
        className="h-auto w-full rounded"
      >
        <rect width="25" height="25" fill="#ffffff" />
        {cells}
      </svg>
    </div>
  )
}
