import { useState } from 'react';
import { useInvoices } from '../context/InvoiceContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Clock, TrendingUp, ShieldCheck, DollarSign, BarChart3, ArrowRight } from 'lucide-react';
import InvoiceList from '../components/InvoiceList';
import InvoiceDetailModal from '../components/InvoiceDetailModal';
import { Link } from 'react-router-dom';

const VitorGeneralPanel = () => {
    const { invoices } = useInvoices();
    const { user } = useAuth();
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const pendingCount = invoices.filter(i => i.status === 'pendente').length;
    const approvedCount = invoices.filter(i => i.status === 'aprovada').length;
    const rejectedCount = invoices.filter(i => i.status === 'rejeitada').length;

    const totalValue = invoices.reduce((acc, curr) => {
        const val = parseFloat(curr.amount.replace(/[^\d]/g, '').replace(',', '.')) || 0;
        return acc + val;
    }, 0);

    const formattedTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue);

    return (
        <div className="general-panel-container animate-fade">
            <header className="panel-header">
                <div className="badge"><ShieldCheck size={16} /> Controle Executivo</div>
                <h1>Painel Geral de Operações</h1>
                <p>Visão de saúde financeira e fluxo de processos da Pedrosa Construtora em Salvador.</p>
            </header>

            <div className="stats-grid-large">
                <div className="stat-card-main">
                    <div className="stat-icon-circle"><DollarSign size={32} /></div>
                    <div className="stat-content">
                        <span className="label">Volume Total Movimentado</span>
                        <h2 className="value">{formattedTotal}</h2>
                    </div>
                </div>

                <div className="stat-card-main">
                    <div className="stat-icon-circle secondary"><BarChart3 size={32} /></div>
                    <div className="stat-content">
                        <span className="label">Total de Notas Processadas</span>
                        <h2 className="value">{invoices.length}</h2>
                    </div>
                </div>
            </div>

            <div className="distribution-grid">
                <div className="dist-card pending">
                    <div className="dist-header">
                        <Clock size={20} />
                        <span>Aguardando Auditoria</span>
                    </div>
                    <span className="dist-count">{pendingCount}</span>
                    <p>Notas fiscais enviadas pelos engenheiros para análise.</p>
                </div>

                <div className="dist-card approved">
                    <div className="dist-header">
                        <CheckCircle2 size={20} />
                        <span>Fluxo Aprovado</span>
                    </div>
                    <span className="dist-count">{approvedCount}</span>
                    <p>Submissões já validadas e prontas para o Admin.</p>
                </div>

                <div className="dist-card rejected">
                    <div className="dist-header">
                        <TrendingUp size={20} className="rotate-icon" />
                        <span>Notas com Erro</span>
                    </div>
                    <span className="dist-count">{rejectedCount}</span>
                    <p>Notas que apresentaram inconsistências técnicas.</p>
                </div>
            </div>

            {/* SEÇÃO EXCLUSIVA PARA O ANALISTA: NOTAS QUE ESTÃO CHEGANDO */}
            {user?.role === 'analyst' && (
                <div className="analyst-focus-section mt-5">
                    <div className="section-header-flex">
                        <div className="title-group">
                            <h2 className="section-title">Notas que estão chegando</h2>
                            <p className="section-sub">Fila de entrada imediata para sua aprovação</p>
                        </div>
                        <Link to="/aprovar" className="view-all-link">
                            Gerenciar Fila Completa <ArrowRight size={16} />
                        </Link>
                    </div>

                    <InvoiceList
                        role="vitor"
                        forceStatus="pendente"
                        onDetailClick={(inv) => setSelectedInvoice(inv)}
                    />
                </div>
            )}

            <InvoiceDetailModal
                invoice={selectedInvoice}
                role="vitor"
                isOpen={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
            />

            <style jsx>{`
                .general-panel-container { max-width: 1200px; margin: 0 auto; }
                
                .panel-header { margin-bottom: 3rem; }
                .badge { 
                    display: inline-flex; align-items: center; gap: 0.5rem; 
                    background: #1d1d1f; color: white; padding: 0.5rem 1rem; 
                    border-radius: 50px; font-size: 0.75rem; font-weight: 700;
                    margin-bottom: 1.5rem;
                }
                .panel-header h1 { font-size: 3rem; color: #1d1d1f; margin-bottom: 1rem; letter-spacing: -0.02em; }
                .panel-header p { font-size: 1.25rem; color: #86868b; max-width: 600px; line-height: 1.4; }

                .stats-grid-large { 
                    display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;
                }
                
                .stat-card-main {
                    background: white; border-radius: 24px; padding: 2.5rem;
                    display: flex; align-items: center; gap: 2rem;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.04);
                    border: 1px solid #f2f2f2;
                }

                .stat-icon-circle {
                    width: 80px; height: 80px; border-radius: 20px;
                    background: #fdf2f2; color: #c1121f;
                    display: flex; align-items: center; justify-content: center;
                }
                .stat-icon-circle.secondary { background: #f5f5f7; color: #1d1d1f; }

                .label { display: block; font-size: 0.875rem; font-weight: 600; color: #86868b; text-transform: uppercase; margin-bottom: 0.5rem; }
                .value { font-size: 2.5rem; font-weight: 800; color: #1d1d1f; }

                .distribution-grid {
                    display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
                }

                .dist-card {
                    background: white; padding: 2rem; border-radius: 20px;
                    border: 1px solid #f2f2f2; transition: transform 0.2s;
                }
                .dist-card:hover { transform: translateY(-5px); }

                .dist-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; font-weight: 700; font-size: 0.9rem; }
                .dist-count { display: block; font-size: 3.5rem; font-weight: 800; margin-bottom: 1rem; line-height: 1; }
                .dist-card p { font-size: 0.875rem; color: #86868b; line-height: 1.5; }

                .pending { border-left: 6px solid #ff9500; }
                .pending .dist-header { color: #ff9500; }
                .approved { border-left: 6px solid #34c759; }
                .approved .dist-header { color: #34c759; }
                .rejected { border-left: 6px solid #c1121f; }
                .rejected .dist-header { color: #c1121f; }

                .analyst-focus-section {
                    margin-top: 4rem;
                }

                .section-header-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 2rem;
                }

                .section-title { font-size: 1.75rem; color: #1d1d1f; margin-bottom: 0.25rem; }
                .section-sub { color: #86868b; font-size: 1rem; }

                .view-all-link {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #c1121f;
                    font-weight: 700;
                    font-size: 0.9rem;
                    transition: var(--transition);
                }

                .view-all-link:hover { opacity: 0.8; transform: translateX(5px); }

                .mt-5 { margin-top: 3rem; }

                @media (max-width: 900px) {
                    .stats-grid-large, .distribution-grid { grid-template-columns: 1fr; }
                    .panel-header h1 { font-size: 2.25rem; }
                    .section-header-flex { flex-direction: column; align-items: flex-start; gap: 1rem; }
                }
            `}</style>
        </div>
    );
};

export default VitorGeneralPanel;
