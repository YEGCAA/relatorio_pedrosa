import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InvoiceProvider } from './context/InvoiceContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import EngineerDashboard from './pages/EngineerDashboard';
import VitorGeneralPanel from './pages/VitorGeneralPanel';
import VitorApprovalPage from './pages/VitorApprovalPage';
import VitorHistoryPage from './pages/VitorHistoryPage';
import VitorFlowPage from './pages/VitorFlowPage';
import Profile from './pages/Profile';
import { useState } from 'react';
import InvoiceDetailModal from './components/InvoiceDetailModal';
import InvoiceForm from './components/InvoiceForm';

const AppRoutes = () => {
  const { user } = useAuth();
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <InvoiceProvider>
      <Layout>
        <Routes>
          {/* Dashboard Geral */}
          <Route path="/" element={user.role === 'engineer' ? <EngineerDashboard /> : <VitorGeneralPanel />} />

          {/* Rotas de Engenheiro */}
          {user.role === 'engineer' && (
            <Route path="/enviar" element={<div className="max-w-4xl mx-auto"><InvoiceForm /></div>} />
          )}

          {/* Rotas de Analista */}
          {user.role === 'analyst' && (
            <Route path="/aprovar" element={<VitorApprovalPage />} />
          )}

          {/* Rotas de Admin */}
          {user.role === 'admin' && (
            <Route path="/fluxo" element={<VitorFlowPage />} />
          )}

          <Route path="/historico" element={<VitorHistoryPage />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </InvoiceProvider>
  );
};


function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
