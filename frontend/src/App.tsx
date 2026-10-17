import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { CreateProjectWizard } from './pages/CreateProjectWizard';
import { DesignStudioPage } from './pages/DesignStudioPage';
import { CustomizeItemPage } from './pages/CustomizeItemPage';
import { PricingPage } from './pages/PricingPage';
import { QuotationPreviewPage } from './pages/QuotationPreviewPage';
import { OrdersPage } from './pages/OrdersPage';
import { InventoryPage } from './pages/InventoryPage';
import { ClientsPage } from './pages/ClientsPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { useAuthStore } from './stores/useAuthStore';

const LoginGate: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1F1C19',
            color: '#F7F6F2',
            fontSize: '13px',
            borderRadius: '2px',
          }
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginGate />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/new" element={<CreateProjectWizard />} />
            <Route path="/projects/:id/design" element={<DesignStudioPage />} />
            <Route path="/projects/:id/design/customize/:itemId" element={<CustomizeItemPage />} />
            <Route path="/projects/:id/pricing" element={<PricingPage />} />
            <Route path="/projects/:id/quotation" element={<QuotationPreviewPage />} />
            <Route path="/quotations" element={<QuotationPreviewPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/evaluation" element={<EvaluationPage />} />
            {/* Reports removed from product nav — demo fixtures were misleading for FYP */}
            <Route path="/reports" element={<Navigate to="/evaluation" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
