import { useState, useEffect } from 'react';
import InvoiceList from '../components/InvoiceList';
import { useInvoices } from '../context/InvoiceContext';
import { CheckCircle2, AlertCircle, Clock, BarChart3, TrendingUp, ShieldCheck, History, ListFilter } from 'lucide-react';
import InvoiceDetailModal from '../components/InvoiceDetailModal';
import { useLocation } from 'react-router-dom';

const VitorDashboard = () => {
    const { invoices } = useInvoices();
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const location = useLocation();

    // Switch view mode based on path
    const [viewMode, setViewMode] = useState(location.pathname === '/aprovar' ? 'pending' : 'history');

    useEffect(() => {
        if (location.pathname === '/aprovar') {
            setViewMode('pending');
        } else if (location.pathname === '/historico') {
            setViewMode('history');
        }
    }, [location.pathname]);

    const pendingInvoices = invoices.filter(i => i.status === 'pendente');
    const approvedInvoices = invoices.filter(i => i.status === 'aprovada');

    const stats = {
        pending: pendingInvoices.length,
        approvedCount: approvedInvoices.length,
        totalValue: invoices.reduce((acc, curr) => {
            const val = parseFloat(curr.amount.replace(/[^\d]/g, '').replace(',', '.')) || 0;
            return acc + val;
        }, 0),
    };

    const formattedTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalValue);

    return (
        <div className="dashboard-container animate-fade">
            <header className="admin-hero">
                <div className="hero-top">
                    <div className="hero-badge">
                        <ShieldCheck size={16} />
                        <span>Módulo Admin</span>
                    </div>
                    <h1>{viewMode === 'pending' ? 'Centro de Aprovações' : 'Histórico de Notas'}</h1>
                    <p>
                        {viewMode === 'pending'
                            ? 'Audite as submissões técnicas e aprove os pagamentos pendentes.'
                            : 'Acompanhe o registro completo de todas as movimentações financeiras.'}
                    </p>
                </div>

                <div className="hero-stats">
                    <div className="hero-stat-item">
                        <span className="h-stat-label">Volume Total</span>
                        <span className="h-stat-value">{formattedTotal}</span>
                    </div>
                    <div className="divider-v"></div>
                    <div className="hero-stat-item">
                        <span className="h-stat-label">Taxa de Aprovação</span>
                        <span className="h-stat-value">
                            {stats.approvedCount > 0 ? Math.round((stats.approvedCount / (invoices.length || 1)) * 100) : 0}%
                        </span>
                    </div>
                </div>
            </header>

            <div className="vitor-stats-grid">
                <div className={`v-stat-card card ${viewMode === 'pending' ? 'active-card' : ''}`} onClick={() => setViewMode('pending')}>
                    <div className="v-stat-icon warning">
                        <Clock size={28} />
                    </div>
                    <div className="v-stat-info">
                        <span className="v-stat-count">{stats.pending}</span>
                        <span className="v-stat-label">Pendentes</span>
                    </div>
                    <div className="v-stat-trend up">Ação requerida</div>
                </div>

                <div className="v-stat-card card">
                    <div className="v-stat-icon success">
                        <CheckCircle2 size={28} />
                    </div>
                    <div className="v-stat-info">
                        <span className="v-stat-count">{stats.approvedCount}</span>
                        <span className="v-stat-label">Aprovadas</span>
                    </div>
                    <div className="v-stat-trend">Verificado</div>
                </div>

                <div className={`v-stat-card card ${viewMode === 'history' ? 'active-card' : ''}`} onClick={() => setViewMode('history')}>
                    <div className="v-stat-icon primary">
                        <History size={28} />
                    </div>
                    <div className="v-stat-info">
                        <span className="v-stat-count">{invoices.length}</span>
                        <span className="v-stat-label">Total GERAL</span>
                    </div>
                    <div className="v-stat-trend">Registros totais</div>
                </div>
            </div>

            <div className="main-action-section">
                <InvoiceList
                    role="vitor"
                    forceStatus={viewMode === 'pending' ? 'pendente' : null}
                    onDetailClick={(inv) => setSelectedInvoice(inv)}
                />
            </div>

            <InvoiceDetailModal
                invoice={selectedInvoice}
                role="vitor"
                isOpen={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
            />

            <style jsx>{`
        .dashboard-container { max-width: 1400px; margin: 0 auto; }
        
        .admin-hero {
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          padding: 2.5rem;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.8rem;
          background: #1D1D1F;
          color: white;
          border-radius: var(--radius-full);
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .admin-hero h1 { font-size: 2.25rem; color: var(--text-main); line-height: 1.1; margin-bottom: 0.5rem; }
        .admin-hero p { color: var(--text-muted); font-size: 1rem; max-width: 480px; }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 2.5rem;
          background: #FAFBFC;
          padding: 1.5rem 2rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
        }

        .h-stat-label { display: block; font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.25rem; }
        .h-stat-value { font-size: 1.5rem; font-weight: 800; color: var(--text-main); }

        .divider-v { width: 1px; height: 40px; background: var(--border); }

        .vitor-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .v-stat-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.5rem 2rem;
          cursor: pointer;
          transition: var(--transition);
          border: 2px solid transparent;
        }

        .v-stat-card:hover { border-color: var(--border); }
        .v-stat-card.active-card { border-color: var(--primary); background: rgba(193, 18, 31, 0.01); }

        .v-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .v-stat-icon.warning { background: rgba(255, 149, 0, 0.1); color: var(--warning); }
        .v-stat-icon.success { background: rgba(52, 199, 89, 0.1); color: var(--success); }
        .v-stat-icon.primary { background: rgba(193, 18, 31, 0.1); color: var(--primary); }

        .v-stat-count { display: block; font-size: 2rem; font-weight: 800; color: var(--text-main); line-height: 1; margin-bottom: 0.25rem; }
        .v-stat-label { font-size: 0.875rem; font-weight: 600; color: var(--text-muted); }

        .v-stat-trend { font-size: 0.75rem; font-weight: 700; padding-top: 0.75rem; border-top: 1px solid var(--border); }
        .v-stat-trend.up { color: var(--warning); }

        @media (max-width: 1200px) {
          .admin-hero { flex-direction: column; align-items: flex-start; padding: 2rem; }
          .hero-stats { width: 100%; justify-content: space-around; }
        }

        @media (max-width: 768px) {
          .vitor-stats-grid { grid-template-columns: 1fr; }
          .admin-hero h1 { font-size: 1.75rem; }
        }
      `}</style>
        </div>
    );
};

export default VitorDashboard;
