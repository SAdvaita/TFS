import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { InvoicesList } from './pages/InvoicesList';
import { InvoiceCreate } from './pages/InvoiceCreate';
import { InvoiceView } from './pages/InvoiceView';
import { QuotationsList } from './pages/QuotationsList';
import { QuotationCreate } from './pages/QuotationCreate';
import { CustomersList } from './pages/CustomersList';
import { CustomerDetail } from './pages/CustomerDetail';
import { ProductsList } from './pages/ProductsList';
import { LicensesList } from './pages/LicensesList';
import { DcList } from './pages/DcList';
import { DcCreate } from './pages/DcCreate';
import { FireDrillList } from './pages/FireDrillList';
import { FireDrillCreate } from './pages/FireDrillCreate';
import { Reports } from './pages/Reports';
import { ExcelExport } from './pages/ExcelExport';
import { Settings } from './pages/Settings';
import { AuditLogsList } from './pages/AuditLogsList';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            
            {/* Invoices */}
            <Route path="invoices" element={<InvoicesList />} />
            <Route path="invoices/create" element={<InvoiceCreate initialDocType="INVOICE" />} />
            <Route path="invoices/:id" element={<InvoiceView />} />
            <Route path="invoices/:id/edit" element={<InvoiceCreate initialDocType="INVOICE" />} />

            {/* Quotations */}
            <Route path="quotations" element={<QuotationsList />} />
            <Route path="quotations/create" element={<QuotationCreate />} />
            <Route path="quotations/:id" element={<InvoiceView />} />

            {/* Customers */}
            <Route path="customers" element={<CustomersList />} />
            <Route path="customers/:id" element={<CustomerDetail />} />

            {/* Product Descriptions */}
            <Route path="products" element={<ProductsList />} />

            {/* Licenses */}
            <Route path="licenses" element={<LicensesList />} />

            {/* DC (Delivery Challan) */}
            <Route path="dc" element={<DcList />} />
            <Route path="dc/create" element={<DcCreate />} />

            {/* Fire Drill Reports */}
            <Route path="fire-drill-reports" element={<FireDrillList />} />
            <Route path="fire-drill-reports/create" element={<FireDrillCreate />} />

            {/* Reports & Analytics */}
            <Route path="reports" element={<Reports />} />

            {/* Excel Export & Import */}
            <Route path="excel-export" element={<ExcelExport />} />

            {/* Settings */}
            <Route path="settings" element={<Settings />} />

            {/* Audit Logs */}
            <Route path="audit-logs" element={<AuditLogsList />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
