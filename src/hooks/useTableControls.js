import { useState } from 'react'

export function useTableControls(initial = {}) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(initial)

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function resetFilters() {
    setQuery('')
    setFilters(initial)
  }

  return { query, setQuery, filters, setFilter, setFilters, resetFilters }
}
