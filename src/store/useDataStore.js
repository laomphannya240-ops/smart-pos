import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createSeedData } from '../data/demoData'
import { calculateTotals } from '../utils/calc'
import { round } from '../utils/format'
import { reference, uid } from '../utils/id'

const seed = createSeedData()

function makeActivity(action, params = {}) {
  return {
    id: uid('act'),
    action,
    params,
    createdAt: new Date().toISOString(),
  }
}

function withActivity(state, action, params, patch = {}) {
  return {
    ...patch,
    activities: [makeActivity(action, params), ...(patch.activities ?? state.activities)].slice(
      0,
      60,
    ),
  }
}

function purchaseStockUpdate(state, purchase, receivedAt) {
  const movements = []

  const products = state.products.map((product) => {
    const line = purchase.items.find((item) => item.productId === product.id)
    if (!line) return product
    const before = product.stock
    const after = before + Number(line.qty || 0)
    movements.push({
      id: uid('mov'),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: 'in',
      change: Number(line.qty || 0),
      before,
      after,
      note: `Purchase ${purchase.number} received`,
      reference: purchase.number,
      createdAt: receivedAt,
    })
    return { ...product, stock: after }
  })

  return { products, movements }
}

export const useDataStore = create(
  persist(
    (set, get) => ({
      ...seed,

      /* ---------------- Products ---------------- */
      addProduct: (data) => {
        const product = {
          status: 'active',
          image: '',
          emoji: '📦',
          stock: 0,
          minStock: 0,
          ...data,
          id: uid('prd'),
          createdAt: new Date().toISOString(),
        }
        set((state) =>
          withActivity(state, 'product.created', { product: product.name }, {
            products: [product, ...state.products],
          }),
        )
        return product
      },
      updateProduct: (id, data) => {
        set((state) =>
          withActivity(state, 'product.updated', { product: data.name }, {
            products: state.products.map((product) =>
              product.id === id ? { ...product, ...data } : product,
            ),
          }),
        )
      },
      deleteProduct: (id) => {
        const product = get().products.find((item) => item.id === id)
        set((state) => ({
          products: state.products.filter((item) => item.id !== id),
          activities: [
            makeActivity('product.deleted', { product: product?.name || '' }),
            ...state.activities,
          ].slice(0, 60),
        }))
      },

      /* ---------------- Categories ---------------- */
      addCategory: (data) => {
        const category = { ...data, id: uid('cat'), createdAt: new Date().toISOString() }
        set((state) => ({
          categories: [category, ...state.categories],
          activities: [
            makeActivity('category.created', { category: category.name }),
            ...state.activities,
          ].slice(0, 60),
        }))
        return category
      },
      updateCategory: (id, data) => {
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? { ...category, ...data } : category,
          ),
          activities: [
            makeActivity('category.updated', { category: data.name }),
            ...state.activities,
          ].slice(0, 60),
        }))
      },
      deleteCategory: (id) => {
        const category = get().categories.find((item) => item.id === id)
        set((state) => ({
          categories: state.categories.filter((item) => item.id !== id),
          activities: [
            makeActivity('category.deleted', { category: category?.name || '' }),
            ...state.activities,
          ].slice(0, 60),
        }))
      },

      /* ---------------- Customers ---------------- */
      addCustomer: (data) => {
        const customer = {
          notes: '',
          status: 'active',
          ...data,
          id: uid('cus'),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          customers: [customer, ...state.customers],
          activities: [
            makeActivity('customer.created', { name: customer.name }),
            ...state.activities,
          ].slice(0, 60),
        }))
        return customer
      },
      updateCustomer: (id, data) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === id ? { ...customer, ...data } : customer,
          ),
          activities: [
            makeActivity('customer.updated', { name: data.name }),
            ...state.activities,
          ].slice(0, 60),
        }))
      },
      deleteCustomer: (id) => {
        const customer = get().customers.find((item) => item.id === id)
        set((state) => ({
          customers: state.customers.filter((item) => item.id !== id),
          activities: [
            makeActivity('customer.deleted', { name: customer?.name || '' }),
            ...state.activities,
          ].slice(0, 60),
        }))
      },

      /* ---------------- Suppliers ---------------- */
      addSupplier: (data) => {
        const supplier = {
          status: 'active',
          ...data,
          id: uid('sup'),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          suppliers: [supplier, ...state.suppliers],
          activities: [
            makeActivity('supplier.created', { name: supplier.name }),
            ...state.activities,
          ].slice(0, 60),
        }))
        return supplier
      },
      updateSupplier: (id, data) => {
        set((state) => ({
          suppliers: state.suppliers.map((supplier) =>
            supplier.id === id ? { ...supplier, ...data } : supplier,
          ),
          activities: [
            makeActivity('supplier.updated', { name: data.name }),
            ...state.activities,
          ].slice(0, 60),
        }))
      },
      deleteSupplier: (id) => {
        const supplier = get().suppliers.find((item) => item.id === id)
        set((state) => ({
          suppliers: state.suppliers.filter((item) => item.id !== id),
          activities: [
            makeActivity('supplier.deleted', { name: supplier?.name || '' }),
            ...state.activities,
          ].slice(0, 60),
        }))
      },

      /* ---------------- Users ---------------- */
      addUser: (data) => {
        const user = {
          status: 'active',
          ...data,
          id: uid('usr'),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          users: [user, ...state.users],
          activities: [
            makeActivity('user.created', { name: user.name }),
            ...state.activities,
          ].slice(0, 60),
        }))
        return user
      },
      updateUser: (id, data) => {
        set((state) => ({
          users: state.users.map((user) => (user.id === id ? { ...user, ...data } : user)),
        }))
      },
      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        }))
      },

      /* ---------------- Stock ---------------- */
      adjustStock: ({ productId, type, quantity, note = '' }) => {
        const product = get().products.find((item) => item.id === productId)
        if (!product) return null
        const qty = Number(quantity) || 0
        let change = 0
        if (type === 'in') change = qty
        else if (type === 'out') change = -qty
        else change = qty - product.stock

        const after = Math.max(0, product.stock + change)
        const actualChange = after - product.stock
        const createdAt = new Date().toISOString()

        const movement = {
          id: uid('mov'),
          productId,
          productName: product.name,
          sku: product.sku,
          type,
          change: actualChange,
          before: product.stock,
          after,
          note,
          createdAt,
        }

        set((state) => ({
          products: state.products.map((item) =>
            item.id === productId ? { ...item, stock: after } : item,
          ),
          movements: [movement, ...state.movements],
          activities: [
            makeActivity('stock.adjusted', { product: product.name, stock: after }),
            ...state.activities,
          ].slice(0, 60),
        }))

        return movement
      },

      /* ---------------- Sales & payments ---------------- */
      addSale: (payload) => {
        const state = get()
        const {
          items = [],
          customerId = null,
          customerName = 'Walk-in Customer',
          cashierId,
          cashierName,
          discount = 0,
          taxRate = 0,
          paymentMethod = 'cash',
          cashReceived = 0,
          note = '',
        } = payload

        const totals = calculateTotals(items, { discount, taxRate })
        const createdAt = new Date().toISOString()
        const number = reference('INV', state.sales)

        const sale = {
          id: uid('sale'),
          number,
          customerId,
          customerName,
          cashierId,
          cashierName,
          items,
          subtotal: totals.subtotal,
          discount: totals.discount,
          taxRate,
          tax: totals.tax,
          total: totals.total,
          profit: totals.profit,
          paymentMethod,
          cashReceived: paymentMethod === 'cash' ? Number(cashReceived) : totals.total,
          change:
            paymentMethod === 'cash'
              ? round(Number(cashReceived) - totals.total)
              : 0,
          status: 'completed',
          note,
          createdAt,
        }

        const payment = {
          id: uid('pay'),
          transactionId: `TXN-${Date.now().toString().slice(-8)}`,
          saleId: sale.id,
          saleNumber: sale.number,
          customerName,
          cashierName,
          method: paymentMethod,
          amount: totals.total,
          status: 'completed',
          createdAt,
        }

        const movements = items.map((item) => {
          const product = state.products.find((entry) => entry.id === item.productId)
          const before = product?.stock ?? item.stock ?? 0
          return {
            id: uid('mov'),
            productId: item.productId,
            productName: item.name,
            sku: product?.sku || '',
            type: 'out',
            change: -Number(item.qty || 0),
            before,
            after: Math.max(0, before - Number(item.qty || 0)),
            note: `Sale ${number}`,
            reference: number,
            createdAt,
          }
        })

        const products = state.products.map((product) => {
          const line = items.find((item) => item.productId === product.id)
          if (!line) return product
          return {
            ...product,
            stock: Math.max(0, product.stock - Number(line.qty || 0)),
          }
        })

        set({
          sales: [sale, ...state.sales],
          payments: [payment, ...state.payments],
          products,
          movements: [...movements, ...state.movements],
          activities: [
            makeActivity('sale.completed', { number, amount: totals.total }),
            ...state.activities,
          ].slice(0, 60),
        })

        return sale
      },

      refundSale: (id) => {
        const state = get()
        const sale = state.sales.find((item) => item.id === id)
        if (!sale || sale.status !== 'completed') return sale

        const refundedAt = new Date().toISOString()
        const movements = (sale.items || []).map((item) => {
          const product = state.products.find((entry) => entry.id === item.productId)
          const before = product?.stock ?? item.stock ?? 0
          return {
            id: uid('mov'),
            productId: item.productId,
            productName: item.name,
            sku: product?.sku || '',
            type: 'in',
            change: Number(item.qty || 0),
            before,
            after: before + Number(item.qty || 0),
            note: `Refund ${sale.number}`,
            reference: sale.number,
            createdAt: refundedAt,
          }
        })

        const products = state.products.map((product) => {
          const line = (sale.items || []).find((item) => item.productId === product.id)
          if (!line) return product
          return { ...product, stock: Number(product.stock || 0) + Number(line.qty || 0) }
        })

        set({
          sales: state.sales.map((item) =>
            item.id === id ? { ...item, status: 'refunded', refundedAt } : item,
          ),
          payments: state.payments.map((payment) =>
            payment.saleId === id ? { ...payment, status: 'refunded' } : payment,
          ),
          products,
          movements: [...movements, ...state.movements],
          activities: [
            makeActivity('sale.refunded', { number: sale.number }),
            ...state.activities,
          ].slice(0, 60),
        })

        return { ...sale, status: 'refunded', refundedAt }
      },

      /* ---------------- Purchases ---------------- */
      addPurchase: (payload) => {
        const state = get()
        const supplier = state.suppliers.find((item) => item.id === payload.supplierId)
        const number = reference('PO', state.purchases)
        const createdAt = new Date().toISOString()
        const purchase = {
          ...payload,
          id: uid('pur'),
          number,
          supplierName: supplier?.name || '',
          total: round(
            payload.items.reduce(
              (sum, item) => sum + Number(item.cost || 0) * Number(item.qty || 0),
              0,
            ),
          ),
          createdAt,
          receivedAt: null,
        }
        set((current) => ({
          purchases: [purchase, ...current.purchases],
          activities: [
            makeActivity('purchase.created', { number }),
            ...current.activities,
          ].slice(0, 60),
        }))
        return purchase
      },
      receivePurchase: (id) => {
        const state = get()
        const purchase = state.purchases.find((item) => item.id === id)
        if (!purchase || purchase.status === 'received') return purchase
        const receivedAt = new Date().toISOString()
        const stockUpdate = purchaseStockUpdate(state, purchase, receivedAt)

        set({
          products: stockUpdate.products,
          movements: [...stockUpdate.movements, ...state.movements],
          purchases: state.purchases.map((item) =>
            item.id === id ? { ...item, status: 'received', receivedAt } : item,
          ),
          activities: [
            makeActivity('purchase.received', { number: purchase.number }),
            ...state.activities,
          ].slice(0, 60),
        })

        return { ...purchase, status: 'received', receivedAt }
      },
      deletePurchase: (id) => {
        set((state) => ({
          purchases: state.purchases.filter((item) => item.id !== id),
        }))
      },

      /* ---------------- Expenses ---------------- */
      addExpense: (data) => {
        const expense = {
          ...data,
          id: uid('exp'),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          expenses: [expense, ...state.expenses],
          activities: [
            makeActivity('expense.added', {
              category: expense.category,
              amount: Number(expense.amount),
            }),
            ...state.activities,
          ].slice(0, 60),
        }))
        return expense
      },
      updateExpense: (id, data) => {
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id ? { ...expense, ...data } : expense,
          ),
        }))
      },
      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        }))
      },

      /* ---------------- Demo utilities ---------------- */
      resetData: () => set(createSeedData()),
    }),
    {
      name: 'smartpos.data.v1',
      version: 1,
    },
  ),
)
