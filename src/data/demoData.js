import { calculateTotals } from '../utils/calc'
import { round } from '../utils/format'

export const DEMO_PASSWORD = 'password123'

export const DEMO_ACCOUNTS = [
  { role: 'admin', email: 'admin@smartpos.com', name: 'Alex Morgan' },
  { role: 'manager', email: 'manager@smartpos.com', name: 'Dara Sok' },
  { role: 'cashier', email: 'cashier@smartpos.com', name: 'Chanthou Meas' },
]

function mulberry32(seed) {
  let a = seed
  return function random() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function isoDaysAgo(days, hour = 12, minute = 0) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

const categories = [
  { id: 'cat-beverages', name: 'Beverages', emoji: '☕', color: 'amber', description: 'Coffee, tea, juices and soft drinks', status: 'active', createdAt: isoDaysAgo(180) },
  { id: 'cat-snacks', name: 'Snacks', emoji: '🍪', color: 'orange', description: 'Cookies, chips, chocolate and nuts', status: 'active', createdAt: isoDaysAgo(180) },
  { id: 'cat-dairy', name: 'Dairy & Eggs', emoji: '🥛', color: 'sky', description: 'Milk, cheese, yogurt and fresh eggs', status: 'active', createdAt: isoDaysAgo(175) },
  { id: 'cat-bakery', name: 'Bakery', emoji: '🥐', color: 'rose', description: 'Freshly baked breads and pastries', status: 'active', createdAt: isoDaysAgo(170) },
  { id: 'cat-household', name: 'Household', emoji: '🧻', color: 'emerald', description: 'Cleaning and everyday household supplies', status: 'active', createdAt: isoDaysAgo(160) },
  { id: 'cat-personal', name: 'Personal Care', emoji: '🧴', color: 'violet', description: 'Body care, hygiene and wellness products', status: 'active', createdAt: isoDaysAgo(150) },
  { id: 'cat-electronics', name: 'Electronics', emoji: '🎧', color: 'indigo', description: 'Accessories, batteries and small devices', status: 'active', createdAt: isoDaysAgo(140) },
  { id: 'cat-stationery', name: 'Stationery', emoji: '📒', color: 'teal', description: 'Office and school supplies', status: 'active', createdAt: isoDaysAgo(120) },
]

const productBlueprints = [
  ['Arabica Coffee Beans 1kg', 'BEV-001', 'cat-beverages', 18.5, 28.0, 42, 10, '☕', 'Single-origin Arabica beans, medium roast.'],
  ['Iced Coffee Bottle 350ml', 'BEV-002', 'cat-beverages', 1.1, 2.0, 0, 12, '🧋', 'Ready-to-drink sweetened iced coffee.'],
  ['Green Tea Pack (25 bags)', 'BEV-003', 'cat-beverages', 3.2, 5.5, 64, 15, '🍵', 'Fragrant jasmine green tea sachets.'],
  ['Orange Juice 1L', 'BEV-004', 'cat-beverages', 2.1, 3.75, 38, 12, '🧃', '100% pressed orange juice, no added sugar.'],
  ['Sparkling Water 500ml', 'BEV-005', 'cat-beverages', 0.6, 1.25, 120, 24, '💧', 'Chilled sparkling mineral water.'],
  ['Chocolate Chip Cookies', 'SNK-001', 'cat-snacks', 1.4, 2.5, 76, 20, '🍪', 'Crunchy cookies with dark chocolate chips.'],
  ['Salted Potato Chips', 'SNK-002', 'cat-snacks', 1.2, 2.25, 9, 20, '🥔', 'Classic hand-cooked salted chips.'],
  ['Dark Chocolate Bar 70%', 'SNK-003', 'cat-snacks', 2.0, 3.5, 55, 15, '🍫', 'Rich 70% cocoa dark chocolate.'],
  ['Mixed Nuts 250g', 'SNK-004', 'cat-snacks', 3.8, 6.25, 31, 10, '🥜', 'Roasted almonds, cashews and peanuts.'],
  ['Fresh Milk 1L', 'DRY-001', 'cat-dairy', 1.6, 2.75, 24, 12, '🥛', 'Pasteurised full cream fresh milk.'],
  ['Cheddar Cheese Block', 'DRY-002', 'cat-dairy', 4.5, 7.5, 18, 8, '🧀', 'Aged cheddar cheese, 250g block.'],
  ['Free Range Eggs (10)', 'DRY-003', 'cat-dairy', 1.9, 3.2, 6, 12, '🥚', 'Farm fresh free range eggs, tray of 10.'],
  ['Greek Yogurt 500g', 'DRY-004', 'cat-dairy', 2.4, 4.0, 27, 10, '🥣', 'Thick and creamy natural Greek yogurt.'],
  ['Butter Croissant', 'BAK-001', 'cat-bakery', 0.9, 1.75, 32, 15, '🥐', 'Flaky butter croissant baked daily.'],
  ['Sourdough Loaf', 'BAK-002', 'cat-bakery', 2.2, 3.8, 14, 10, '🍞', 'Naturally leavened artisan sourdough.'],
  ['Blueberry Muffin', 'BAK-003', 'cat-bakery', 1.0, 1.9, 4, 10, '🧁', 'Soft muffin loaded with blueberries.'],
  ['Paper Towels 2-pack', 'HHD-001', 'cat-household', 2.6, 4.5, 48, 12, '🧻', 'Absorbent 2-ply kitchen paper towels.'],
  ['Laundry Detergent 2L', 'HHD-002', 'cat-household', 6.4, 9.9, 22, 8, '🧺', 'Concentrated liquid detergent, fresh scent.'],
  ['Dish Soap 750ml', 'HHD-003', 'cat-household', 1.5, 2.75, 36, 12, '🧴', 'Lemon dish soap with grease-lift formula.'],
  ['Multi-surface Cleaner', 'HHD-004', 'cat-household', 2.8, 4.75, 0, 10, '🧽', 'All-purpose antibacterial surface spray.'],
  ['Aloe Body Wash', 'PCR-001', 'cat-personal', 3.2, 5.4, 29, 10, '🧼', 'Soothing aloe vera body wash, 400ml.'],
  ['Bamboo Toothbrush', 'PCR-002', 'cat-personal', 1.0, 2.2, 51, 15, '🪥', 'Eco-friendly soft bristle toothbrush.'],
  ['Wireless Earbuds', 'ELC-001', 'cat-electronics', 18.0, 32.5, 16, 6, '🎧', 'Bluetooth 5.3 earbuds with charging case.'],
  ['USB-C Charging Cable', 'ELC-002', 'cat-electronics', 3.5, 7.5, 43, 12, '🔌', 'Durable 1.5m fast-charge USB-C cable.'],
  ['AA Batteries 4-pack', 'ELC-003', 'cat-electronics', 2.2, 4.25, 8, 12, '🔋', 'Long-lasting alkaline batteries.'],
  ['LED Desk Lamp', 'ELC-004', 'cat-electronics', 11.0, 19.9, 12, 5, '💡', 'Adjustable LED lamp with USB charging port.'],
  ['A5 Hardcover Notebook', 'STN-001', 'cat-stationery', 1.8, 3.5, 67, 20, '📒', 'Dotted A5 notebook with hard cover.'],
  ['Gel Pen Set (4)', 'STN-002', 'cat-stationery', 1.2, 2.5, 90, 25, '🖊️', 'Smooth-writing black gel pens, pack of 4.'],
  ['Sticky Notes Pack', 'STN-003', 'cat-stationery', 0.8, 1.75, 44, 15, '🗒️', 'Assorted pastel sticky notes, 400 sheets.'],
  ['A4 Printer Paper', 'STN-004', 'cat-stationery', 4.2, 6.9, 5, 12, '📄', 'Bright white A4 copy paper, 500 sheets.'],
]

const products = productBlueprints.map((blueprint, index) => {
  const [name, sku, categoryId, costPrice, price, stock, minStock, emoji, description] =
    blueprint
  return {
    id: `prd-${String(index + 1).padStart(3, '0')}`,
    name,
    sku,
    barcode: `885000000${String(index + 1).padStart(4, '0')}`,
    categoryId,
    description,
    costPrice,
    price,
    stock,
    minStock,
    emoji,
    image: '',
    status: 'active',
    createdAt: isoDaysAgo(110 - index),
  }
})

const customerBlueprints = [
  ['Sokha Chenda', '+855 12 345 678', 'sokha.chenda@gmail.com', 'St. 271, Toul Kork, Phnom Penh'],
  ['Dara Vong', '+855 92 118 447', 'dara.vong@gmail.com', 'St. 63, Daun Penh, Phnom Penh'],
  ['Sophea Lim', '+855 77 903 221', 'sophea.lim@outlook.com', 'BKK 1, Chamkarmon, Phnom Penh'],
  ['Vannak Heng', '+855 16 552 980', 'vannak.heng@gmail.com', 'St. 598, Sen Sok, Phnom Penh'],
  ['Mei Lin', '+855 96 771 204', 'mei.lin@gmail.com', 'Olympia City, Phnom Penh'],
  ['James Carter', '+855 10 664 552', 'james.carter@proton.me', 'Riverside, Daun Penh, Phnom Penh'],
  ['Chan Nita', '+855 11 228 903', 'nita.chan@gmail.com', 'St. 310, Boeung Keng Kang, Phnom Penh'],
  ['Rithy Kim', '+855 98 440 771', 'rithy.kim@gmail.com', 'Toul Sangke, Russey Keo, Phnom Penh'],
  ['Bopha Pich', '+855 69 812 337', 'bopha.pich@gmail.com', 'St. 105, Mean Chey, Phnom Penh'],
  ['Srey Mom', '+855 15 309 882', 'sreymom@gmail.com', 'St. 2004, Sen Sok, Phnom Penh'],
  ['Michael Tan', '+855 88 410 556', 'michael.tan@gmail.com', 'Aeon Mall 1, Phnom Penh'],
  ['Kunthea Sok', '+855 17 665 129', 'kunthea.sok@gmail.com', 'Chroy Changvar, Phnom Penh'],
]

const customers = customerBlueprints.map(([name, phone, email, address], index) => ({
  id: `cus-${String(index + 1).padStart(3, '0')}`,
  name,
  phone,
  email,
  address,
  notes: index % 4 === 0 ? 'Loyalty member since 2024' : '',
  status: 'active',
  createdAt: isoDaysAgo(150 - index * 8),
}))

const supplierBlueprints = [
  ['Angkor Wholesale Co.', 'Vibol Meas', '+855 23 998 112', 'orders@angkorwholesale.com.kh', 'St. 217, Phnom Penh', 'WHL-001'],
  ['Mekong Distribution', 'Sreyneang Tao', '+855 23 445 880', 'sales@mekongdist.com.kh', 'St. 106, Phnom Penh', 'WHL-002'],
  ['Golden Harvest Foods', 'Michael Lim', '+855 23 771 604', 'supply@goldenharvest.com', 'St. 371, Phnom Penh', 'WHL-003'],
  ['Khmer Office Supply', 'Rachana Pen', '+855 23 220 548', 'hello@khmersupply.com', 'St. 169, Phnom Penh', 'WHL-004'],
  ['Bayon Electronics Import', 'David Nguyen', '+855 23 887 330', 'import@bayonelec.com', 'St. 60, Phnom Penh', 'WHL-005'],
]

const suppliers = supplierBlueprints.map(
  ([name, contactName, phone, email, address, code], index) => ({
    id: `sup-${String(index + 1).padStart(3, '0')}`,
    name,
    contactName,
    phone,
    email,
    address,
    code,
    status: 'active',
    createdAt: isoDaysAgo(165 - index * 12),
  }),
)

const users = [
  { id: 'usr-admin', name: 'Alex Morgan', email: 'admin@smartpos.com', role: 'admin', phone: '+855 12 000 001', status: 'active', createdAt: isoDaysAgo(365) },
  { id: 'usr-manager', name: 'Dara Sok', email: 'manager@smartpos.com', role: 'manager', phone: '+855 12 000 002', status: 'active', createdAt: isoDaysAgo(300) },
  { id: 'usr-cashier', name: 'Chanthou Meas', email: 'cashier@smartpos.com', role: 'cashier', phone: '+855 12 000 003', status: 'active', createdAt: isoDaysAgo(210) },
  { id: 'usr-cashier2', name: 'Sokha Kim', email: 'cashier2@smartpos.com', role: 'cashier', phone: '+855 12 000 004', status: 'inactive', createdAt: isoDaysAgo(180) },
  { id: 'usr-manager2', name: 'Nita Chhay', email: 'nita@smartpos.com', role: 'manager', phone: '+855 12 000 005', status: 'active', createdAt: isoDaysAgo(140) },
]

const staff = [
  { id: 'usr-cashier', name: 'Chanthou Meas', weight: 5 },
  { id: 'usr-manager', name: 'Dara Sok', weight: 3 },
  { id: 'usr-admin', name: 'Alex Morgan', weight: 2 },
]

function pickStaff(random) {
  const total = staff.reduce((sum, person) => sum + person.weight, 0)
  let roll = random() * total
  for (const person of staff) {
    roll -= person.weight
    if (roll <= 0) return person
  }
  return staff[0]
}

function dailySales() {
  const random = mulberry32(20261114)
  const sales = []
  let sequence = 2000

  for (let day = 89; day >= 0; day -= 1) {
    const weekday = new Date(Date.now() - day * 86400000).getDay()
    const busyDay = weekday === 0 || weekday === 6
    const count = 2 + Math.floor(random() * (busyDay ? 4 : 3))

    for (let n = 0; n < count; n += 1) {
      sequence += 1
      const itemCount = 1 + Math.floor(random() * 4)
      const chosen = new Set()
      const items = []

      for (let i = 0; i < itemCount; i += 1) {
        let product = products[Math.floor(random() * products.length)]
        let attempts = 0
        while (chosen.has(product.id) && attempts < 8) {
          product = products[Math.floor(random() * products.length)]
          attempts += 1
        }
        chosen.add(product.id)
        const qty = 1 + Math.floor(random() * 3)
        items.push({
          productId: product.id,
          name: product.name,
          emoji: product.emoji,
          price: product.price,
          cost: product.costPrice,
          qty,
        })
      }

      const useDiscount = random() < 0.22
      const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
      const discount = useDiscount ? round(Math.min(subtotal * 0.08, 3.5)) : 0
      const totals = calculateTotals(items, { discount, taxRate: 5 })
      const roll = random()
      const paymentMethod = roll < 0.5 ? 'cash' : roll < 0.82 ? 'qr' : 'card'
      const hasCustomer = random() < 0.62
      const customer = hasCustomer
        ? customers[Math.floor(random() * customers.length)]
        : null
      const cashier = pickStaff(random)
      const statusRoll = random()
      const status =
        statusRoll < 0.955 ? 'completed' : statusRoll < 0.985 ? 'refunded' : 'pending'
      const hour = 8 + Math.floor(random() * 12)
      const minute = Math.floor(random() * 60)
      const cashReceived = paymentMethod === 'cash' ? Math.ceil(totals.total) : totals.total

      sales.push({
        id: `sale-${sequence}`,
        number: `INV-${sequence}`,
        customerId: customer?.id || null,
        customerName: customer?.name || 'Walk-in Customer',
        cashierId: cashier.id,
        cashierName: cashier.name,
        items,
        subtotal: totals.subtotal,
        discount: totals.discount,
        taxRate: 5,
        tax: totals.tax,
        total: totals.total,
        profit: totals.profit,
        paymentMethod,
        cashReceived,
        change: round(cashReceived - totals.total),
        status,
        note: '',
        createdAt: isoDaysAgo(day, hour, minute),
      })
    }
  }

  return sales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

const sales = dailySales()

const payments = sales.map((sale, index) => ({
  id: `pay-${String(index + 1).padStart(4, '0')}`,
  transactionId: `TXN-${String(900000 + index + 1)}`,
  saleId: sale.id,
  saleNumber: sale.number,
  customerName: sale.customerName,
  cashierName: sale.cashierName,
  method: sale.paymentMethod,
  amount: sale.total,
  status:
    sale.status === 'completed' ? 'completed' : sale.status === 'refunded' ? 'refunded' : 'pending',
  createdAt: sale.createdAt,
}))

const purchaseBlueprints = [
  { supplier: 0, days: 32, status: 'received', items: [[4, 80], [0, 24], [2, 40]] },
  { supplier: 1, days: 25, status: 'received', items: [[9, 48], [10, 20], [12, 30]] },
  { supplier: 2, days: 18, status: 'received', items: [[6, 60], [7, 40], [8, 25]] },
  { supplier: 3, days: 12, status: 'received', items: [[28, 100], [26, 60], [27, 80]] },
  { supplier: 4, days: 6, status: 'ordered', items: [[22, 20], [23, 60], [24, 30]] },
  { supplier: 0, days: 3, status: 'draft', items: [[1, 48], [3, 36], [5, 50]] },
]

const purchases = purchaseBlueprints.map((blueprint, index) => {
  const supplier = suppliers[blueprint.supplier]
  const items = blueprint.items.map(([productIndex, qty]) => {
    const product = products[productIndex]
    return {
      productId: product.id,
      name: product.name,
      qty,
      cost: product.costPrice,
      emoji: product.emoji,
    }
  })
  const total = round(items.reduce((sum, item) => sum + item.cost * item.qty, 0))
  return {
    id: `pur-${String(index + 1).padStart(3, '0')}`,
    number: `PO-${1001 + index}`,
    supplierId: supplier.id,
    supplierName: supplier.name,
    items,
    total,
    status: blueprint.status,
    note: '',
    createdAt: isoDaysAgo(blueprint.days),
    receivedAt: blueprint.status === 'received' ? isoDaysAgo(blueprint.days - 1) : null,
  }
})

const expenseBlueprints = [
  ['Rent', 850, 'Monthly storefront rent', 28],
  ['Salaries', 2100, 'Team payroll for the month', 26],
  ['Utilities', 185.5, 'Electricity and water bill', 22],
  ['Marketing', 220, 'Social media campaign boost', 18],
  ['Supplies', 96.4, 'Bags, receipt rolls and packaging', 14],
  ['Maintenance', 140, 'Air-conditioner servicing', 11],
  ['Transport', 62, 'Delivery fuel and tuk-tuk fares', 8],
  ['Utilities', 92.75, 'Internet and phone plan', 6],
  ['Supplies', 135, 'Cleaning supplies for the store', 4],
  ['Marketing', 180, 'Locally printed flyers', 2],
  ['Salaries', 320, 'Part-time weekend support', 1],
  ['Maintenance', 75, 'POS printer repair', 0],
]

const expenses = expenseBlueprints.map(([category, amount, description, days], index) => ({
  id: `exp-${String(index + 1).padStart(3, '0')}`,
  category,
  amount,
  description,
  date: isoDaysAgo(days, 10, 30),
  createdAt: isoDaysAgo(days, 10, 30),
}))

const movementTypes = ['in', 'out', 'adjustment']
const movements = Array.from({ length: 36 }).map((_, index) => {
  const product = products[index % products.length]
  const type = movementTypes[index % 3]
  const quantity = 2 + ((index * 7) % 18)
  const before = Math.max(product.stock - (type === 'out' ? quantity : 0), 3)
  const change = type === 'out' ? -quantity : quantity
  return {
    id: `mov-${String(index + 1).padStart(3, '0')}`,
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    type,
    change,
    before,
    after: before + change,
    note:
      type === 'in'
        ? 'Supplier delivery received'
        : type === 'out'
          ? 'Damaged stock removed'
          : 'Cycle count adjustment',
    createdAt: isoDaysAgo(Math.floor(index / 2), 9 + (index % 9), (index * 13) % 60),
  }
})

const activities = [
  { id: 'act-1', action: 'sale.completed', params: { number: sales[0]?.number, amount: sales[0]?.total }, createdAt: sales[0]?.createdAt },
  { id: 'act-2', action: 'stock.low', params: { product: 'A4 Printer Paper' }, createdAt: isoDaysAgo(0, 9, 20) },
  { id: 'act-3', action: 'purchase.received', params: { number: 'PO-1004' }, createdAt: isoDaysAgo(1, 14, 10) },
  { id: 'act-4', action: 'customer.created', params: { name: 'Kunthea Sok' }, createdAt: isoDaysAgo(2, 11, 5) },
  { id: 'act-5', action: 'expense.added', params: { category: 'Marketing', amount: 180 }, createdAt: isoDaysAgo(2, 9, 40) },
  { id: 'act-6', action: 'product.updated', params: { product: 'Wireless Earbuds' }, createdAt: isoDaysAgo(3, 16, 25) },
  { id: 'act-7', action: 'sale.refunded', params: { number: 'INV-2044' }, createdAt: isoDaysAgo(4, 13, 15) },
  { id: 'act-8', action: 'purchase.created', params: { number: 'PO-1005' }, createdAt: isoDaysAgo(6, 10, 0) },
]

export function createSeedData() {
  return {
    categories,
    products,
    customers,
    suppliers,
    users,
    sales,
    payments,
    purchases,
    expenses,
    movements,
    activities,
  }
}

export { products, categories, customers, suppliers }
