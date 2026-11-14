import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Keyboard,
  Minus,
  PackageX,
  Plus,
  ScanLine,
  ShoppingCart,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select } from '../../components/ui/Input'
import { EmptyState } from '../../components/ui/EmptyState'
import { ProductThumb } from '../../components/ui/ProductThumb'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { PaymentModal } from '../../components/pos/PaymentModal'
import { ReceiptModal } from '../../components/pos/ReceiptModal'
import { CustomerFormModal } from '../../components/forms/CustomerForm'
import { useDataStore } from '../../store/useDataStore'
import { useAppStore } from '../../store/useAppStore'
import { useCurrency } from '../../hooks/useCurrency'
import { calculateTotals } from '../../utils/calc'
import { cn } from '../../utils/cn'

export function POS() {
  const { t } = useTranslation()
  const money = useCurrency()
  const products = useDataStore((state) => state.products)
  const categories = useDataStore((state) => state.categories)
  const customers = useDataStore((state) => state.customers)
  const addSale = useDataStore((state) => state.addSale)
  const settings = useAppStore((state) => state.settings)
  const session = useAppStore((state) => state.session)

  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [cart, setCart] = useState([])
  const [discount, setDiscount] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [receiptSale, setReceiptSale] = useState(null)
  const [clearOpen, setClearOpen] = useState(false)
  const [customerModalOpen, setCustomerModalOpen] = useState(false)
  const [mobileView, setMobileView] = useState('products')

  const activeProducts = useMemo(
    () => products.filter((product) => product.status === 'active'),
    [products],
  )

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase()
    return activeProducts
      .filter((product) => categoryId === 'all' || product.categoryId === categoryId)
      .filter(
        (product) =>
          !term ||
          product.name.toLowerCase().includes(term) ||
          product.sku.toLowerCase().includes(term) ||
          String(product.barcode).toLowerCase().includes(term),
      )
      .sort((a, b) => {
        const stockDelta = Number(b.stock > 0) - Number(a.stock > 0)
        if (stockDelta !== 0) return stockDelta
        return a.name.localeCompare(b.name)
      })
  }, [activeProducts, categoryId, query])

  const totals = useMemo(
    () =>
      calculateTotals(cart, {
        discount: Number(discount) || 0,
        taxRate: settings.taxRate,
      }),
    [cart, discount, settings.taxRate],
  )

  const customerName =
    customers.find((customer) => customer.id === customerId)?.name || t('pos.walkIn')

  function addToCart(product) {
    if (product.stock <= 0) {
      toast.error(t('pos.outOfStockToast', { name: product.name }))
      return
    }
    const existing = cart.find((item) => item.productId === product.id)
    if (existing && existing.qty >= product.stock) {
      toast.error(t('pos.stockLimitToast', { name: product.name, stock: product.stock }))
      return
    }
    setCart((current) => {
      const line = current.find((item) => item.productId === product.id)
      if (line) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, qty: Math.min(item.qty + 1, product.stock) }
            : item,
        )
      }
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          cost: product.costPrice,
          emoji: product.emoji,
          image: product.image,
          stock: product.stock,
          qty: 1,
        },
      ]
    })
  }

  function handleBarcode(event) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    const term = query.trim().toLowerCase()
    if (!term) return
    const match = activeProducts.find(
      (product) =>
        String(product.barcode).toLowerCase() === term ||
        product.sku.toLowerCase() === term,
    )
    if (match) {
      addToCart(match)
      setQuery('')
    }
  }

  function changeQty(productId, delta) {
    const line = cart.find((item) => item.productId === productId)
    if (!line) return
    if (delta > 0 && line.qty >= line.stock) {
      toast.error(t('pos.stockLimitToast', { name: line.name, stock: line.stock }))
      return
    }
    const nextQty = line.qty + delta
    if (nextQty <= 0) return
    setCart((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, qty: nextQty } : item,
      ),
    )
  }

  function removeItem(productId) {
    setCart((current) => current.filter((item) => item.productId !== productId))
  }

  function confirmClearCart() {
    setCart([])
    setDiscount('')
    setClearOpen(false)
    setMobileView('products')
    toast.success(t('pos.cartCleared'))
  }

  function handlePayment({ paymentMethod, cashReceived }) {
    const invalid = cart.find((item) => {
      const product = products.find((entry) => entry.id === item.productId)
      return !product || product.stock < item.qty
    })
    if (invalid) {
      toast.error(t('pos.stockChanged', { name: invalid.name }))
      return
    }

    const sale = addSale({
      items: cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        emoji: item.emoji,
        price: item.price,
        cost: item.cost,
        qty: item.qty,
      })),
      customerId: customerId || null,
      customerName,
      cashierId: session.id,
      cashierName: session.name,
      discount: totals.discount,
      taxRate: settings.taxRate,
      paymentMethod,
      cashReceived,
    })

    setPaymentOpen(false)
    setCart([])
    setDiscount('')
    setCustomerId('')
    setMobileView('products')
    setReceiptSale(sale)
    toast.success(t('pos.paymentSuccess', { number: sale.number }))
  }

  const categoryChips = [
    { id: 'all', name: t('common.allProducts'), emoji: '🛍️' },
    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
      emoji: category.emoji,
    })),
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('pos.title')}
        description={t('pos.subtitle')}
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            {t('common.live')}
          </span>
        }
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={UserPlus}
              onClick={() => setCustomerModalOpen(true)}
            >
              {t('pos.newCustomer')}
            </Button>
            <Button
              variant="primary"
              leftIcon={ShoppingCart}
              onClick={() => setMobileView('cart')}
              className="lg:hidden"
            >
              {t('pos.viewCart')} ({totals.itemCount})
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_410px]">
        {/* Products */}
        <div className={cn('min-w-0 space-y-4', mobileView === 'cart' && 'hidden lg:block')}>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <SearchInput
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={handleBarcode}
                  placeholder={t('pos.searchPlaceholder')}
                  className="[&_input]:h-11"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[10px] text-slate-400 dark:bg-slate-800/60 dark:text-slate-500">
                <Keyboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('pos.barcodeHint')}</span>
                <span className="sm:hidden">{t('pos.barcodeHintShort')}</span>
              </div>
            </div>

            <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto pb-0.5">
              {categoryChips.map((category) => {
                const active = categoryId === category.id
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setCategoryId(category.id)}
                    className={cn(
                      'flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition',
                      active
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
                    )}
                  >
                    <span className="leading-none">{category.emoji}</span>
                    {category.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t('pos.productsFound', { count: filteredProducts.length })}
            </p>
            <p className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
              <ScanLine className="h-3.5 w-3.5" />
              {t('pos.tapToAdd')}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <EmptyState
                icon={PackageX}
                title={t('pos.noProducts')}
                description={t('pos.noProductsHint')}
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery('')
                      setCategoryId('all')
                    }}
                  >
                    {t('common.resetFilters')}
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const category = categoryMap.get(product.categoryId)
                const out = product.stock <= 0
                const low = !out && product.stock <= product.minStock
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addToCart(product)}
                    disabled={out}
                    className={cn(
                      'group relative flex flex-col rounded-2xl border bg-white p-3 text-left shadow-sm transition-all duration-200 dark:bg-slate-900',
                      out
                        ? 'cursor-not-allowed border-slate-200 opacity-60 dark:border-slate-800'
                        : 'border-slate-200/80 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-slate-800 dark:hover:border-indigo-500/40',
                    )}
                  >
                    <span className="absolute right-2 top-2 z-10">
                      {out ? (
                        <Badge tone="rose" dot>
                          {t('inventory.outOfStock')}
                        </Badge>
                      ) : low ? (
                        <Badge tone="amber" dot>
                          {t('inventory.low')}
                        </Badge>
                      ) : (
                        <Badge tone="slate">{t('pos.stockLeft', { count: product.stock })}</Badge>
                      )}
                    </span>

                    <ProductThumb
                      product={product}
                      tone={category?.color || 'indigo'}
                      size="lg"
                      className="mt-2 self-center"
                    />
                    <p className="mt-3 line-clamp-2 min-h-8 text-xs font-semibold leading-4 text-slate-800 dark:text-slate-100">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{product.sku}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {money(product.price)}
                      </span>
                      <span
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-lg transition',
                          out
                            ? 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                            : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-500/10 dark:text-indigo-400',
                        )}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {cart.length > 0 && (
            <button
              type="button"
              onClick={() => setMobileView('cart')}
              className="sticky bottom-3 z-20 flex w-full items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-xl shadow-slate-900/25 transition hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 lg:hidden"
            >
              <span className="flex items-center gap-2 text-xs font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-[10px]">
                  {totals.itemCount}
                </span>
                {t('pos.viewCart')}
              </span>
              <span className="flex items-center gap-1.5 text-sm font-bold">
                {money(totals.total)}
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </span>
            </button>
          )}
        </div>

        {/* Cart */}
        <div
          className={cn(
            'flex-col lg:sticky lg:top-[84px] lg:h-[calc(100dvh-120px)]',
            mobileView === 'products' ? 'hidden lg:flex' : 'flex',
          )}
        >
          <div className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setMobileView('products')}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 lg:hidden"
                  aria-label={t('common.back')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <ShoppingCart className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('pos.currentOrder')}
                  </h2>
                  <p className="text-[10px] text-slate-400">
                    {t('pos.itemsCount', { count: totals.itemCount })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setClearOpen(true)}
                  disabled={cart.length === 0}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-rose-500/10"
                  aria-label={t('pos.clearCart')}
                  title={t('pos.clearCart')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Select
                  containerClassName="flex-1"
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                  options={[
                    { value: '', label: t('pos.walkIn') },
                    ...customers
                      .filter((customer) => customer.status === 'active')
                      .map((customer) => ({ value: customer.id, label: customer.name })),
                  ]}
                  className="h-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setCustomerModalOpen(true)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                  title={t('pos.addNewCustomer')}
                >
                  <UserPlus className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                <Users className="h-3 w-3" />
                {customerId
                  ? customers.find((customer) => customer.id === customerId)?.phone
                  : t('pos.walkInHint')}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <EmptyState
                  icon={ShoppingCart}
                  title={t('pos.emptyCart')}
                  description={t('pos.emptyCartHint')}
                  compact
                />
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex gap-2.5 px-4 py-3">
                      <ProductThumb
                        product={item}
                        size="sm"
                        tone={categoryMap.get(
                          products.find((product) => product.id === item.productId)?.categoryId,
                        )?.color}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-2 text-xs font-semibold text-slate-800 dark:text-slate-100">
                            {item.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="rounded p-0.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                            aria-label={t('common.remove')}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {money(item.price)} × {item.qty}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
                            <button
                              type="button"
                              onClick={() => changeQty(item.productId, -1)}
                              className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
                              disabled={item.qty <= 1}
                              aria-label={t('pos.decrease')}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-5 text-center text-[11px] font-bold text-slate-800 dark:text-slate-100">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => changeQty(item.productId, 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
                              disabled={item.qty >= item.stock}
                              aria-label={t('pos.increase')}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {money(item.price * item.qty)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-800/30">
              <div className="grid grid-cols-2 items-end gap-2">
                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {t('common.discount')}
                  </span>
                  <div className="mt-1 flex h-9 items-center overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                    <span className="pl-2.5 text-xs text-slate-400">
                      {settings.currency === 'USD' ? '$' : '៛'}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discount}
                      onChange={(event) => setDiscount(event.target.value)}
                      placeholder="0.00"
                      className="h-full w-full min-w-0 bg-transparent px-1.5 text-xs text-slate-800 outline-none dark:text-slate-100"
                    />
                  </div>
                </label>
                <div className="text-right">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    {t('common.subtotal')}
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    {money(totals.subtotal)}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs">
                {totals.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>{t('common.discount')}</span>
                    <span>−{money(totals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>
                    {t('common.tax')} ({settings.taxRate}%)
                  </span>
                  <span>{money(totals.tax)}</span>
                </div>
                <div className="flex items-end justify-between border-t border-dashed border-slate-300 pt-2 dark:border-slate-700">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('common.grandTotal')}
                  </span>
                  <span className="text-xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
                    {money(totals.total)}
                  </span>
                </div>
              </div>

              <Button
                variant="success"
                size="lg"
                className="mt-3 w-full"
                leftIcon={Banknote}
                disabled={cart.length === 0}
                onClick={() => setPaymentOpen(true)}
              >
                {t('pos.payNow')} · {money(totals.total)}
              </Button>
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setClearOpen(true)}
                  disabled={cart.length === 0}
                  className="text-[10px] font-medium text-slate-400 transition hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t('pos.cancelCheckout')}
                </button>
                <span className="flex items-center gap-1 text-[9px] text-slate-400">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {t('pos.stockAutoUpdate')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        total={totals.total}
        itemCount={totals.itemCount}
        onComplete={handlePayment}
      />

      <ReceiptModal
        open={Boolean(receiptSale)}
        sale={receiptSale}
        onClose={() => setReceiptSale(null)}
        onNewSale={() => setReceiptSale(null)}
      />

      <CustomerFormModal
        open={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onSaved={(customer) => setCustomerId(customer.id)}
      />

      <ConfirmDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={confirmClearCart}
        title={t('pos.clearCartTitle')}
        description={t('pos.clearCartDescription')}
        confirmLabel={t('pos.clearCart')}
        tone="danger"
      />
    </div>
  )
}
