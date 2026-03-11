import { useState } from 'react';
import { useInvoices } from '../context/InvoiceContext';
import { History, Search, Download, FileSpreadsheet, Archive, Filter, Calculator } from 'lucide-react';
import InvoiceList from '../components/InvoiceList';
import InvoiceDetailModal from '../components/InvoiceDetailModal';
import * as XLSX from 'xlsx';

const VitorHistoryPage = () => {
    const { invoices } = useInvoices();
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const totalVolume = invoices.reduce((acc, curr) => {
        const val = parseFloat(curr.amount.replace(/[^\d]/g, '').replace(',', '.')) || 0;
        return acc + val;
    }, 0);

    const formattedVolume = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalVolume);

    const handleExportExcel = () => {
        if (invoices.length === 0) {
            alert('Não há notas no histórico para exportar.');
            return;
        }

        const dataToExport = invoices.map(inv => ({
            'Número NF': inv.number,
            'Fornecedor': inv.supplier,
            'CNPJ': inv.cnpj,
            'Data Emissão': new Date(inv.date).toLocaleDateString('pt-BR'),
            'Valor Bruto': inv.amount,
            'Centro de Custo': inv.costCenter,
            'Projeto / Obra': inv.project,
            'Status': inv.status.toUpperCase(),
            'Link da Pasta': inv.pasta || 'Sem link'
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Histórico de Notas');
        const fileName = `Historico_Geral_NF_Pedrosa_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    return (
        <div className="history-page-container animate-fade">
            <header className="history-hero">
                <div className="hero-main">
                    <div className="hero-badge"><Archive size={14} /> Repositório Central</div>
                    <h1>Histórico e Auditoria</h1>
                    <p>Relatório completo de todas as notas fiscais processadas, permitindo rastreabilidade e análise histórica.</p>
                </div>

                <div className="hero-stats-panel">
                    <div className="h-stat">
                        <span className="h-label">Volume Total</span>
                        <span className="h-value">{formattedVolume}</span>
                    </div>
                    <button className="btn-action-luxury" onClick={handleExportExcel}>
                        <FileSpreadsheet size={18} />
                        <span>Baixar Backup (.xlsx)</span>
                    </button>
                </div>
            </header>

            <div className="history-main-content">
                <InvoiceList
                    role="vitor"
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
                .history-page-container { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 2.5rem; }
                
                .history-hero {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                    padding: 3rem;
                    border-radius: 30px;
                    border: 1px solid var(--border);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.03);
                }

                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.6rem;
                    background: #f1f5f9;
                    color: #475569;
                    padding: 0.5rem 1.25rem;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 1.5rem;
                }

                .hero-main h1 { font-size: 3rem; color: #0f172a; margin-bottom: 0.75rem; font-weight: 800; letter-spacing: -0.02em; }
                .hero-main p { color: #64748b; font-size: 1.125rem; max-width: 550px; line-height: 1.5; }

                .hero-stats-panel {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 1.5rem;
                }

                .h-stat { text-align: right; }
                .h-label { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; display: block; }
                .h-value { font-size: 2rem; font-weight: 800; color: #0f172a; }

                .btn-action-luxury {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: #1d1d1f;
                    color: white;
                    padding: 1rem 1.75rem;
                    border-radius: 16px;
                    font-weight: 700;
                    font-size: 0.9375rem;
                    transition: all 0.3s;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }

                .btn-action-luxury:hover { background: #334155; transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,0,0,0.15); }

                @media (max-width: 1024px) {
                    .history-hero { flex-direction: column; align-items: flex-start; gap: 2rem; padding: 2.5rem; }
                    .hero-stats-panel { align-items: flex-start; width: 100%; }
                    .h-stat { text-align: left; }
                }
            `}</style>
        </div>
    );
};

export default VitorHistoryPage;
