import { useState } from 'react';
import { useInvoices } from '../context/InvoiceContext';
import { CheckCircle2, Clock, ShieldCheck, ListFilter, AlertCircle } from 'lucide-react';
import InvoiceList from '../components/InvoiceList';
import InvoiceDetailModal from '../components/InvoiceDetailModal';

const VitorApprovalPage = () => {
    const { invoices, updateBulkInvoicesStatus } = useInvoices();
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkApproving, setIsBulkApproving] = useState(false);

    const pendingInvoices = invoices.filter(i => i.status === 'pendente');

    const handleBulkApprove = async () => {
        if (selectedIds.length === 0) return;

        const confirm = window.confirm(`Deseja aprovar todas as ${selectedIds.length} notas selecionadas?`);
        if (!confirm) return;

        setIsBulkApproving(true);
        try {
            await updateBulkInvoicesStatus(selectedIds, 'aprovada');
            setSelectedIds([]);
            alert(`${selectedIds.length} notas foram aprovadas com sucesso!`);
        } catch (err) {
            alert('Erro ao aprovar notas em lote.');
        } finally {
            setIsBulkApproving(false);
        }
    };

    return (
        <div className="approval-page-container animate-fade">
            <header className="page-header">
                <div className="header-top-row">
                    <div className="status-indicator">
                        <Clock size={20} />
                        <span>{pendingInvoices.length} notas aguardando sua decisão</span>
                    </div>
                    {selectedIds.length > 0 && (
                        <button
                            className="btn-bulk-approve"
                            onClick={handleBulkApprove}
                            disabled={isBulkApproving}
                        >
                            <CheckCircle2 size={18} />
                            {isBulkApproving ? 'Aprovando...' : `Aprovar Selecionadas (${selectedIds.length})`}
                        </button>
                    )}
                </div>
                <h1>Fila de Aprovação</h1>
                <p>Analise a documentação técnica e autorize o pagamento das notas enviadas pelos engenheiros.</p>
            </header>

            <div className="action-area">
                <div className="list-card-wrapper">
                    <InvoiceList
                        role="vitor"
                        forceStatus="pendente"
                        selectable={true}
                        onSelectionChange={(ids) => setSelectedIds(ids)}
                        onDetailClick={(inv) => setSelectedInvoice(inv)}
                    />
                </div>
            </div>

            <InvoiceDetailModal
                invoice={selectedInvoice}
                role="vitor"
                isOpen={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
            />

            <style jsx>{`
                .approval-page-container { max-width: 1400px; margin: 0 auto; }
                
                .page-header { 
                    margin-bottom: 2.5rem; 
                    background: #fff;
                    padding: 2.5rem;
                    border-radius: 20px;
                    border: 1px solid #f2f2f2;
                }
                
                .header-top-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .btn-bulk-approve {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: #34c759;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(52, 199, 89, 0.2);
                }

                .btn-bulk-approve:hover:not(:disabled) {
                    background: #28a745;
                    transform: translateY(-2px);
                }

                .btn-bulk-approve:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .status-indicator {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: #fff9e6;
                    color: #b27b16;
                    padding: 0.6rem 1.2rem;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 0.9rem;
                }

                .page-header h1 { font-size: 2.5rem; color: #1d1d1f; margin-bottom: 0.75rem; }
                .page-header p { color: #86868b; font-size: 1.125rem; }

                .action-area {
                    background: transparent;
                }

                @media (max-width: 768px) {
                    .page-header { padding: 1.5rem; }
                    .page-header h1 { font-size: 1.75rem; }
                }
            `}</style>
        </div>
    );
};

export default VitorApprovalPage;
