import {
  BarChart3,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Package,
  Receipt,
  ScanLine,
  Settings,
  Tags,
  Truck,
  UserCog,
  Users,
  Wallet,
  Warehouse,
} from 'lucide-react'

export const navSections = [
  {
    key: 'nav.main',
    items: [
      { key: 'dashboard', to: '/dashboard', icon: LayoutDashboard, module: 'dashboard' },
      { key: 'pos', to: '/pos', icon: ScanLine, module: 'pos' },
    ],
  },
  {
    key: 'nav.catalog',
    items: [
      { key: 'products', to: '/products', icon: Package, module: 'products' },
      { key: 'categories', to: '/categories', icon: Tags, module: 'categories' },
      { key: 'inventory', to: '/inventory', icon: Warehouse, module: 'inventory' },
    ],
  },
  {
    key: 'nav.people',
    items: [
      { key: 'customers', to: '/customers', icon: Users, module: 'customers' },
      { key: 'suppliers', to: '/suppliers', icon: Truck, module: 'suppliers' },
    ],
  },
  {
    key: 'nav.operations',
    items: [
      { key: 'purchases', to: '/purchases', icon: ClipboardList, module: 'purchases' },
      { key: 'sales', to: '/sales', icon: Receipt, module: 'sales' },
      { key: 'payments', to: '/payments', icon: CreditCard, module: 'payments' },
      { key: 'expenses', to: '/expenses', icon: Wallet, module: 'expenses' },
    ],
  },
  {
    key: 'nav.insights',
    items: [{ key: 'reports', to: '/reports', icon: BarChart3, module: 'reports' }],
  },
  {
    key: 'nav.admin',
    items: [
      { key: 'users', to: '/users', icon: UserCog, module: 'users' },
      { key: 'settings', to: '/settings', icon: Settings, module: 'settings' },
    ],
  },
]

export const pageTitleKeys = {
  dashboard: 'nav.dashboard',
  pos: 'nav.pos',
  products: 'nav.products',
  categories: 'nav.categories',
  inventory: 'nav.inventory',
  customers: 'nav.customers',
  suppliers: 'nav.suppliers',
  purchases: 'nav.purchases',
  sales: 'nav.sales',
  payments: 'nav.payments',
  reports: 'nav.reports',
  users: 'nav.users',
  expenses: 'nav.expenses',
  settings: 'nav.settings',
  profile: 'nav.profile',
  'change-password': 'nav.changePassword',
  unauthorized: 'errors.forbiddenTitle',
}
