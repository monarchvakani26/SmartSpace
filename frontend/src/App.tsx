import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppLayout } from './components/layout/AppLayout';
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
import { ReportsPage } from './pages/ReportsPage';
import { ClientsPage } from './pages/ClientsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0F1629',
            color: '#fff',
            fontSize: '13px',
            borderRadius: '10px',
          }
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Authenticated Layout */}
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
          <Route path="/reports" element={<ReportsPage />} />

          {/* Stubs for other menu items */}
          <Route path="/vendors" element={<OrdersPage />} />
          <Route path="/tasks" element={<DashboardPage />} />
          <Route path="/settings" element={<DashboardPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
