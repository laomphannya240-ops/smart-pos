import { useAppStore } from '../store/useAppStore'
import { formatCurrency } from '../utils/format'

export function useCurrency() {
  const currency = useAppStore((state) => state.settings.currency)
  return (value) => formatCurrency(value, currency)
}
