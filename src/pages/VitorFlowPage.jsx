import { useState } from 'react';
import { useInvoices } from '../context/InvoiceContext';
import { Wallet, History, FileSpreadsheet, Download, TrendingUp, CheckCircle2, ShieldCheck, DollarSign, PieChart } from 'lucide-react';
import InvoiceList from '../components/InvoiceList';
import InvoiceDetailModal from '../components/InvoiceDetailModal';
import * as XLSX from 'xlsx';

const VitorFlowPage = () => {
    const { invoices } = useInvoices();
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    // O Admin (Diretoria) vê o fluxo das notas que já foram processadas (aprovadas ou rejeitadas) pelo analista
    const processedInvoices = invoices.filter(i => i.status === 'aprovada' || i.status === 'rejeitada');
    const approvedInvoices = invoices.filter(i => i.status === 'aprovada');
    const rejectedInvoices = invoices.filter(i => i.status === 'rejeitada');

    const totalApprovedValue = approvedInvoices.reduce((acc, curr) => {
        const val = parseFloat(curr.amount.replace(/[^\d]/g, '').replace(',', '.')) || 0;
        return acc + val;
    }, 0);

    const formattedTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalApprovedValue);

    const handleExportExcel = () => {
        if (processedInvoices.length === 0) {
            alert('Não há notas processadas para exportar no momento.');
            return;
        }

        const dataToExport = processedInvoices.map(inv => ({
            'Número NF': inv.number,
            'Fornecedor': inv.supplier,
            'CNPJ': inv.cnpj,
            'Data Emissão': new Date(inv.date).toLocaleDateString('pt-BR'),
            'Valor Bruto': inv.amount,
            'Centro de Custo': inv.costCenter,
            'Projeto / Obra': inv.project,
            'Observações': inv.observations || '-',
            'Status': inv.status.toUpperCase(),
            'Link da Pasta': inv.pasta || 'Sem link'
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Fluxo de Notas Fiscais');

        const fileName = `Relatorio_Fluxo_Pedrosa_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    return (
        <div className="flow-page-container animate-fade">
            <header className="flow-hero">
                <div className="hero-content">
                    <div className="hero-pill shadow-sm"><ShieldCheck size={14} /> Controle Executivo</div>
                    <h1>Fluxo de Notas Fiscais</h1>
                    <p>Relatório estratégico de todas as notas verificadas e auditorias concluídas pelo analista.</p>
                </div>

                <div className="hero-actions">
                    <button className="btn-export-luxury" onClick={handleExportExcel}>
                        <FileSpreadsheet size={20} />
                        <span>Exportar Relatório Geral</span>
                    </button>
                </div>
            </header>

            <div className="stats-dashboard">
                <div className="mini-card-stat approved">
                    <div className="stat-icon-box"><CheckCircle2 size={24} /></div>
                    <div className="stat-info">
                        <span className="label">Notas Aprovadas</span>
                        <h3 className="value">{approvedInvoices.length}</h3>
                    </div>
                </div>

                <div className="mini-card-stat rejected">
                    <div className="stat-icon-box"><TrendingUp size={24} className="rotate-icon" /></div>
                    <div className="stat-info">
                        <span className="label">Notas Recusadas</span>
                        <h3 className="value">{rejectedInvoices.length}</h3>
                    </div>
                </div>

                <div className="mini-card-stat total">
                    <div className="stat-icon-box"><DollarSign size={24} /></div>
                    <div className="stat-info">
                        <span className="label">Montante Aprovado (Caixa)</span>
                        <h3 className="value">{formattedTotal}</h3>
                    </div>
                </div>
            </div>

            <div className="main-content">
                <InvoiceList
                    role="admin"
                    onDetailClick={(inv) => setSelectedInvoice(inv)}
                />
            </div>

            <InvoiceDetailModal
                invoice={selectedInvoice}
                role="admin"
                isOpen={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
            />

            <style jsx>{`
                .flow-page-container { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 2.5rem; }
                
                .flow-hero {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                    padding: 3rem;
                    border-radius: 30px;
                    border: 1px solid var(--border);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.03);
                    position: relative;
                    overflow: hidden;
                }

                .flow-hero::after {
                    content: '';
                    position: absolute;
                    top: 0; right: 0;
                    width: 300px; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(193, 18, 31, 0.02));
                    pointer-events: none;
                }

                .hero-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.6rem;
                    background: #1d1d1f;
                    color: white;
                    padding: 0.5rem 1.25rem;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 1.5rem;
                }

                .hero-content h1 { font-size: 3rem; color: #0f172a; margin-bottom: 0.75rem; letter-spacing: -0.02em; font-weight: 800; }
                .hero-content p { color: #64748b; font-size: 1.125rem; max-width: 600px; line-height: 1.5; }

                .btn-export-luxury {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: var(--primary);
                    color: white;
                    padding: 1.25rem 2rem;
                    border-radius: 18px;
                    font-weight: 800;
                    font-size: 1rem;
                    transition: all 0.3s;
                    box-shadow: 0 15px 30px rgba(193, 18, 31, 0.2);
                }

                .btn-export-luxury:hover {
                    background: #a10f1a;
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px rgba(193, 18, 31, 0.25);
                }

                .stats-dashboard {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 2rem;
                }

                .mini-card-stat {
                    background: white;
                    padding: 2rem;
                    border-radius: 24px;
                    border: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    transition: transform 0.3s;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
                }

                .mini-card-stat:hover { transform: translateY(-5px); border-color: #cbd5e1; }

                .stat-icon-box {
                    width: 60px; height: 60px; border-radius: 16px;
                    display: flex; align-items: center; justify-content: center;
                }

                .approved .stat-icon-box { background: #f0fdf4; color: #22c55e; }
                .rejected .stat-icon-box { background: #fef2f2; color: #ef4444; }
                .total .stat-icon-box { background: #f8fafc; color: #1e293b; }

                .stat-info { display: flex; flex-direction: column; gap: 0.25rem; }
                .stat-info .label { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
                .stat-info .value { font-size: 1.75rem; font-weight: 800; color: #0f172a; }

                .rotate-icon { transform: rotate(90deg); }

                @media (max-width: 1024px) {
                    .stats-dashboard { grid-template-columns: 1fr; }
                    .flow-hero { flex-direction: column; align-items: flex-start; gap: 2rem; padding: 2.5rem; }
                    .hero-content h1 { font-size: 2.25rem; }
                }
            `}</style>
        </div>
    );
};

export default VitorFlowPage;
