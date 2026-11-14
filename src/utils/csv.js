function escapeCell(value) {
  const text = value === null || value === undefined ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

export function downloadCSV(filename, columns, rows) {
  const header = columns.map((column) => escapeCell(column.label)).join(',')
  const body = rows
    .map((row) =>
      columns
        .map((column) => {
          const value =
            typeof column.value === 'function' ? column.value(row) : row[column.key]
          return escapeCell(value)
        })
        .join(','),
    )
    .join('\n')

  const csv = `\uFEFF${[header, body].filter(Boolean).join('\n')}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
