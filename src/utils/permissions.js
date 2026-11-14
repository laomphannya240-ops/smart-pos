export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
}

export const ROLE_ACCESS = {
  dashboard: ['admin', 'manager'],
  pos: ['admin', 'manager', 'cashier'],
  products: ['admin', 'manager'],
  categories: ['admin', 'manager'],
  inventory: ['admin', 'manager'],
  customers: ['admin', 'manager', 'cashier'],
  suppliers: ['admin', 'manager'],
  purchases: ['admin', 'manager'],
  sales: ['admin', 'manager', 'cashier'],
  payments: ['admin', 'manager'],
  reports: ['admin', 'manager'],
  expenses: ['admin', 'manager'],
  users: ['admin'],
  settings: ['admin'],
  profile: ['admin', 'manager', 'cashier'],
}

export function canAccess(role, module) {
  return Boolean(role) && (ROLE_ACCESS[module] || []).includes(role)
}

export function homePathForRole(role) {
  return role === ROLES.CASHIER ? '/pos' : '/dashboard'
}

export function roleLabelKey(role) {
  return `role.${role}`
}
