import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Toaster } from 'react-hot-toast'
import i18n from './i18n'
import { useAppStore } from './store/useAppStore'
import { AppLayout } from './layouts/AppLayout'
import {
  GuestRoute,
  HomeRedirect,
  ProtectedRoute,
  RoleRoute,
} from './routes/guards'
import { Login } from './pages/auth/Login'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { ResetPassword } from './pages/auth/ResetPassword'
import { Dashboard } from './pages/dashboard/Dashboard'
import { POS } from './pages/pos/POS'
import { Products } from './pages/products/Products'
import { Categories } from './pages/categories/Categories'
import { Inventory } from './pages/inventory/Inventory'
import { Customers } from './pages/customers/Customers'
import { Suppliers } from './pages/suppliers/Suppliers'
import { Purchases } from './pages/purchases/Purchases'
import { Sales } from './pages/sales/Sales'
import { Payments } from './pages/payments/Payments'
import { Reports } from './pages/reports/Reports'
import { Users } from './pages/users/Users'
import { Expenses } from './pages/expenses/Expenses'
import { Settings } from './pages/settings/Settings'
import { Profile } from './pages/profile/Profile'
import { ChangePassword } from './pages/profile/ChangePassword'
import { Unauthorized } from './pages/errors/Unauthorized'
import { NotFound } from './pages/errors/NotFound'

export default function App() {
  useTranslation()
  const theme = useAppStore((state) => state.theme)
  const language = useAppStore((state) => state.language)

  useEffect(() => {
    if (i18n.language !== language) i18n.changeLanguage(language)
  }, [language])

  const dark = theme === 'dark'

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <GuestRoute>
              <ResetPassword />
            </GuestRoute>
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomeRedirect />} />
            <Route
              path="dashboard"
              element={
                <RoleRoute module="dashboard">
                  <Dashboard />
                </RoleRoute>
              }
            />
            <Route
              path="pos"
              element={
                <RoleRoute module="pos">
                  <POS />
                </RoleRoute>
              }
            />
            <Route
              path="products"
              element={
                <RoleRoute module="products">
                  <Products />
                </RoleRoute>
              }
            />
            <Route
              path="categories"
              element={
                <RoleRoute module="categories">
                  <Categories />
                </RoleRoute>
              }
            />
            <Route
              path="inventory"
              element={
                <RoleRoute module="inventory">
                  <Inventory />
                </RoleRoute>
              }
            />
            <Route
              path="customers"
              element={
                <RoleRoute module="customers">
                  <Customers />
                </RoleRoute>
              }
            />
            <Route
              path="suppliers"
              element={
                <RoleRoute module="suppliers">
                  <Suppliers />
                </RoleRoute>
              }
            />
            <Route
              path="purchases"
              element={
                <RoleRoute module="purchases">
                  <Purchases />
                </RoleRoute>
              }
            />
            <Route
              path="sales"
              element={
                <RoleRoute module="sales">
                  <Sales />
                </RoleRoute>
              }
            />
            <Route
              path="payments"
              element={
                <RoleRoute module="payments">
                  <Payments />
                </RoleRoute>
              }
            />
            <Route
              path="reports"
              element={
                <RoleRoute module="reports">
                  <Reports />
                </RoleRoute>
              }
            />
            <Route
              path="users"
              element={
                <RoleRoute module="users">
                  <Users />
                </RoleRoute>
              }
            />
            <Route
              path="expenses"
              element={
                <RoleRoute module="expenses">
                  <Expenses />
                </RoleRoute>
              }
            />
            <Route
              path="settings"
              element={
                <RoleRoute module="settings">
                  <Settings />
                </RoleRoute>
              }
            />
            <Route
              path="profile"
              element={
                <RoleRoute module="profile">
                  <Profile />
                </RoleRoute>
              }
            />
            <Route
              path="change-password"
              element={
                <RoleRoute module="profile">
                  <ChangePassword />
                </RoleRoute>
              }
            />
            <Route path="403" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>

      <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
          duration: 3200,
          style: {
            background: dark ? '#0f172a' : '#ffffff',
            color: dark ? '#e2e8f0' : '#0f172a',
            border: dark ? '1px solid #1e293b' : '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: dark
              ? '0 16px 40px -20px rgb(0 0 0 / 0.8)'
              : '0 16px 40px -24px rgb(15 23 42 / 0.45)',
            fontSize: '13px',
            fontWeight: 500,
            padding: '10px 14px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#ffffff' } },
        }}
      />
    </BrowserRouter>
  )
}
