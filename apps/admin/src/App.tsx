import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './routes/login';
import { DashboardPage } from './routes/_authenticated/dashboard';
import { UsersPage } from './routes/_authenticated/users';
import { UserDetailPage } from './routes/_authenticated/users/detail';
import { ProductsPage } from './routes/_authenticated/products';
import { CreateProductPage } from './routes/_authenticated/products/create';
import { EditProductPage } from './routes/_authenticated/products/edit';
import { StockPage } from './routes/_authenticated/stock';
import { SalesPage } from './routes/_authenticated/sales';
import { CreateSalePage } from './routes/_authenticated/sales/create';
import { InvoicePage } from './routes/_authenticated/sales/invoice';
import { OrdersPage } from './routes/_authenticated/orders';
import { OrderDetailPage } from './routes/_authenticated/orders/detail';
import { PaymentsPage } from './routes/_authenticated/payments';
import { CouponsPage } from './routes/_authenticated/coupons';
import { ReportsPage } from './routes/_authenticated/reports';
import { SettingsPage } from './routes/_authenticated/settings';
import { PermissionsPage } from './routes/_authenticated/permissions';
import { CategoriesPage } from './routes/_authenticated/categories';
import { AdminLayout } from './shared/components/admin-layout';
import { AuthGuard } from './features/auth/auth-guard';
import { SuperAdminGuard } from './features/auth/super-admin-guard';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <AuthGuard>
            <AdminLayout />
          </AuthGuard>
        }
      >
        {/* All admin + super_admin */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/create" element={<SuperAdminGuard><CreateProductPage /></SuperAdminGuard>} />
        <Route path="/products/:productId" element={<SuperAdminGuard><EditProductPage /></SuperAdminGuard>} />
        <Route path="/categories" element={<SuperAdminGuard><CategoriesPage /></SuperAdminGuard>} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/sales/create" element={<CreateSalePage />} />
        <Route path="/sales/:saleId/invoice" element={<InvoicePage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/coupons" element={<SuperAdminGuard><CouponsPage /></SuperAdminGuard>} />

        {/* Super admin only */}
        <Route path="/reports" element={<SuperAdminGuard><ReportsPage /></SuperAdminGuard>} />
        <Route path="/users" element={<SuperAdminGuard><UsersPage /></SuperAdminGuard>} />
        <Route path="/users/:userId" element={<SuperAdminGuard><UserDetailPage /></SuperAdminGuard>} />
        <Route path="/permissions" element={<SuperAdminGuard><PermissionsPage /></SuperAdminGuard>} />
        <Route path="/settings" element={<SuperAdminGuard><SettingsPage /></SuperAdminGuard>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
