import { useState } from 'react';
import InvoiceForm from '../components/InvoiceForm';
import InvoiceList from '../components/InvoiceList';
import { useInvoices } from '../context/InvoiceContext';
import { Plus, ListTodo, CheckCircle, XCircle, Clock, FileText, ArrowRight } from 'lucide-react';
import InvoiceDetailModal from '../components/InvoiceDetailModal';

const EngineerDashboard = () => {
    const { invoices } = useInvoices();
    const [showForm, setShowForm] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const stats = {
        total: invoices.length,
        pending: invoices.filter(i => i.status === 'pendente').length,
        approved: invoices.filter(i => i.status === 'aprovada').length,
        rejected: invoices.filter(i => i.status === 'rejeitada').length,
    };

    return (
        <div className="dashboard-container container-wide animate-fade">
            <header className="dashboard-hero">
                <div className="hero-content">
                    <div className="hero-pill">Painel Técnico</div>
                    <h1>Olá, Engenheiro Responsável</h1>
                    <p>Seu centro de controle para submissão de notas fiscais da Pedrosa em Salvador.</p>
                </div>

                <button className="btn-primary hero-cta" onClick={() => setShowForm(!showForm)}>
                    {showForm ? (
                        <>Ver Extrato de Notas</>
                    ) : (
                        <>
                            <Plus size={20} />
                            Nova Submissão de NF
                        </>
                    )}
                </button>
            </header>

            <div className="stats-grid">
                <div className="stat-box card">
                    <div className="stat-label">Total Submetido</div>
                    <div className="stat-main">
                        <span className="stat-number">{stats.total}</span>
                        <div className="stat-icon-bg"><FileText size={24} /></div>
                    </div>
                    <div className="stat-footer">Histórico acumulado</div>
                </div>

                <div className="stat-box card border-warning">
                    <div className="stat-label">Aguardando Análise</div>
                    <div className="stat-main">
                        <span className="stat-number color-warning">{stats.pending}</span>
                        <div className="stat-icon-bg bg-warning"><Clock size={24} /></div>
                    </div>
                    <div className="stat-footer">Fluxo de auditoria</div>
                </div>

                <div className="stat-box card border-success">
                    <div className="stat-label">Aprovadas e Liberadas</div>
                    <div className="stat-main">
                        <span className="stat-number color-success">{stats.approved}</span>
                        <div className="stat-icon-bg bg-success"><CheckCircle size={24} /></div>
                    </div>
                    <div className="stat-footer">Pronto para pagamento</div>
                </div>

                <div className="stat-box card border-danger">
                    <div className="stat-label">Notas Rejeitadas</div>
                    <div className="stat-main">
                        <span className="stat-number color-danger">{stats.rejected}</span>
                        <div className="stat-icon-bg bg-danger"><XCircle size={24} /></div>
                    </div>
                    <div className="stat-footer">Necessitam correção</div>
                </div>
            </div>

            <div className="main-content-section mt-4">
                {showForm ? (
                    <InvoiceForm onSuccess={() => setShowForm(false)} />
                ) : (
                    <InvoiceList role="engineer" onDetailClick={(inv) => setSelectedInvoice(inv)} />
                )}
            </div>

            <InvoiceDetailModal
                invoice={selectedInvoice}
                role="engineer"
                isOpen={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
            />

            <style jsx>{`
        .dashboard-container { max-width: 1400px; margin: 0 auto; }
        
        .dashboard-hero {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 3rem;
          padding: 3rem;
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          position: relative;
          overflow: hidden;
        }

        .hero-content h1 { font-size: 2.5rem; margin: 0.75rem 0; color: var(--text-main); }
        .hero-content p { color: var(--text-muted); font-size: 1.125rem; max-width: 500px; }
        
        .hero-pill {
          display: inline-block;
          padding: 0.375rem 1rem;
          background: rgba(193, 18, 31, 0.08);
          color: var(--primary);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .hero-cta { height: 56px; padding: 0 2rem; font-size: 1rem; box-shadow: 0 10px 20px rgba(193, 18, 31, 0.15); }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .stat-box {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .stat-label { font-size: 0.8125rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; }
        .stat-main { display: flex; justify-content: space-between; align-items: center; }
        .stat-number { font-size: 2.5rem; font-weight: 800; line-height: 1; }
        
        .stat-icon-bg {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F4F7F6;
          color: var(--text-muted);
        }

        .bg-warning { background: rgba(255, 149, 0, 0.1); color: var(--warning); }
        .bg-success { background: rgba(52, 199, 89, 0.1); color: var(--success); }
        .bg-danger { background: rgba(255, 59, 48, 0.1); color: var(--danger); }

        .color-warning { color: var(--warning); }
        .color-success { color: var(--success); }
        .color-danger { color: var(--danger); }

        .stat-footer { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); opacity: 0.7; }

        .border-warning { border-bottom: 4px solid var(--warning); }
        .border-success { border-bottom: 4px solid var(--success); }
        .border-danger { border-bottom: 4px solid var(--danger); }

        @media (max-width: 1200px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .dashboard-hero { flex-direction: column; align-items: flex-start; gap: 2rem; padding: 2rem; }
        }

        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
};

export default EngineerDashboard;
