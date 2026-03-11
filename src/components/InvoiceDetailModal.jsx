import { useEffect, useState } from 'react';
import { useInvoices } from '../context/InvoiceContext';
import { useToast } from '../context/ToastContext';
import { X, Check, FileText, Calendar, Building, DollarSign, Hash, Info, ChevronRight, AlertCircle, Clock, ExternalLink, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

const InvoiceDetailModal = ({ invoice, role, isOpen, onClose }) => {
    const { updateInvoiceStatus } = useInvoices();
    const { showToast } = useToast();
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);

    const [isProcessing, setIsProcessing] = useState(false);
    const [storageFiles, setStorageFiles] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(false);

    useEffect(() => {
        const fetchFiles = async () => {
            if (isOpen && invoice?.pasta?.startsWith('supabase://')) {
                setLoadingFiles(true);
                try {
                    const path = invoice.pasta.replace('supabase://nuvem/', '');
                    const { data, error } = await supabase.storage
                        .from('nuvem')
                        .list(path);

                    if (error) throw error;

                    const filesWithUrls = data.map(file => {
                        const { data: { publicUrl } } = supabase.storage
                            .from('nuvem')
                            .getPublicUrl(`${path}/${file.name}`);
                        return { ...file, publicUrl };
                    });

                    setStorageFiles(filesWithUrls);
                } catch (err) {
                    console.error('Erro ao listar arquivos:', err);
                } finally {
                    setLoadingFiles(false);
                }
            } else {
                setStorageFiles([]);
            }
        };

        fetchFiles();
    }, [isOpen, invoice]);

    if (!isOpen || !invoice) return null;

    const isSupabaseStorage = invoice?.pasta?.startsWith('supabase://');

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            await updateInvoiceStatus(invoice.id, 'aprovada');
            showToast('Nota Fiscal aprovada com sucesso!', 'success');
            onClose();
        } catch (error) {
            showToast('Erro ao aprovar nota fiscal.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = () => {
        if (!rejectionReason) {
            showToast('Por favor, informe o motivo da rejeição.', 'error');
            return;
        }
        updateInvoiceStatus(invoice.id, 'rejeitada', rejectionReason);
        showToast('Nota Fiscal rejeitada.', 'error');
        setRejectionReason('');
        setShowRejectForm(false);
        onClose();
    };

    const closeModal = () => {
        setShowRejectForm(false);
        setRejectionReason('');
        onClose();
    };

    const getStatusClass = (status) => {
        if (status === 'aprovada') return 'status-box-approved';
        if (status === 'rejeitada') return 'status-box-rejected';
        return 'status-box-pending';
    };

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-container card animate-fade" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <div className="header-left">
                        <div className="doc-icon">📄</div>
                        <div>
                            <h3>Auditoria de NF #{invoice?.number || '---'}</h3>
                            <p>Detalhes técnicos e histórico de aprovação</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={closeModal}><X size={24} /></button>
                </header>

                <div className="modal-content">
                    <div className={`status-summary ${getStatusClass(invoice?.status)}`}>
                        <div className="status-label">
                            {invoice?.status === 'pendente' && <Clock size={18} />}
                            {invoice?.status === 'aprovada' && <Check size={18} />}
                            {invoice?.status === 'rejeitada' && <AlertCircle size={18} />}
                            <span>Status Atual: <strong>{(invoice?.status || 'pendente').toUpperCase()}</strong></span>
                        </div>
                        <p className="status-date">Iniciado em {invoice?.timestamp ? new Date(invoice.timestamp).toLocaleString('pt-BR') : '---'}</p>
                    </div>

                    <div className="info-grid">
                        <div className="info-group">
                            <label><Building size={14} /> Fornecedor</label>
                            <div className="info-val">{invoice.supplier}</div>
                        </div>
                        <div className="info-group">
                            <label><Hash size={14} /> CNPJ de Faturamento</label>
                            <div className="info-val">{invoice.cnpj}</div>
                        </div>
                        <div className="info-group">
                            <label><Calendar size={14} /> Data da NF</label>
                            <div className="info-val">{invoice?.date ? new Date(invoice.date).toLocaleDateString('pt-BR') : '---'}</div>
                        </div>
                        <div className="info-group">
                            <label><DollarSign size={14} /> Valor Total Bruto</label>
                            <div className="info-val highlight-val">{invoice.amount}</div>
                        </div>
                        <div className="info-group">
                            <label>Centro de Custo</label>
                            <div className="info-val">{invoice.costCenter}</div>
                        </div>
                        <div className="info-group">
                            <label>Projeto Destino</label>
                            <div className="info-val">{invoice.project}</div>
                        </div>
                    </div>

                    <div className="obs-section">
                        <label><Info size={14} /> Observações do Solicitante</label>
                        <p>{invoice.observations || 'Nenhuma observação informada.'}</p>
                    </div>

                    <div className="attachment-preview">
                        <label>Documentação (Anexos do Sistema)</label>
                        {isSupabaseStorage ? (
                            <div className="storage-files-container">
                                {loadingFiles ? (
                                    <div className="loading-files">Carregando arquivos...</div>
                                ) : storageFiles.length > 0 ? (
                                    <div className="files-grid-mini">
                                        {storageFiles.map((file, idx) => (
                                            <div key={idx} className="file-item-mini">
                                                <div className="mini-icon">
                                                    {file.name.match(/\.(jpg|jpeg|png)$/i) ? '🖼️' : '📄'}
                                                </div>
                                                <div className="mini-info">
                                                    <span title={file.name}>{file.name}</span>
                                                </div>
                                                <a href={file.publicUrl} target="_blank" rel="noopener noreferrer" className="mini-download">
                                                    <ExternalLink size={14} />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-files">Nenhum arquivo encontrado nesta pasta.</p>
                                )}
                            </div>
                        ) : (
                            <div className="file-card">
                                <FileText size={32} color="var(--primary)" />
                                <div className="file-info">
                                    <span className="file-name">Link da Pasta Externa</span>
                                    <span className="file-size">Acesso via URL fornecida</span>
                                </div>
                                {invoice.pasta ? (
                                    <a href={invoice.pasta} target="_blank" rel="noopener noreferrer" className="btn-secondary sm-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        Abrir Link
                                    </a>
                                ) : (
                                    <span className="no-link">Sem link</span>
                                )}
                            </div>
                        )}
                    </div>

                    {invoice.status === 'rejeitada' && (
                        <div className="rejection-reason-box">
                            <h4>Motivo da Rejeição</h4>
                            <p>{invoice.rejectionReason}</p>
                        </div>
                    )}

                    {showRejectForm && (
                        <div className="reject-interaction animate-fade">
                            <label>Descreva o motivo da rejeição</label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Informe os erros encontrados ou o porquê da não aprovação..."
                                autoFocus
                            />
                            <div className="interaction-actions">
                                <button className="btn-primary danger-bg" onClick={handleReject}>Confirmar Rejeição</button>
                                <button className="btn-secondary" onClick={() => setShowRejectForm(false)}>Voltar</button>
                            </div>
                        </div>
                    )}
                </div>

                {(role === 'vitor' || role === 'analyst') && invoice.status === 'pendente' && !showRejectForm && (
                    <footer className="modal-footer">
                        <button className="btn-primary success-bg" onClick={handleApprove} disabled={isProcessing}>
                            {isProcessing ? <span className="loading-spinner"></span> : <><Check size={18} /> Aprovar Pagamento</>}
                        </button>
                        <button className="btn-secondary danger-text" onClick={() => setShowRejectForm(true)} disabled={isProcessing}>
                            <X size={18} /> Rejeitar Nota
                        </button>
                    </footer>
                )}
            </div>

            <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(29, 29, 31, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .modal-container {
          width: 100%;
          max-width: 680px;
          background: white;
          max-height: 90vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          padding: 0;
        }

        .modal-header {
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
        }

        .header-left { display: flex; align-items: center; gap: 1rem; }
        .doc-icon { width: 40px; height: 40px; background: #F4F7F6; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
        .header-left h3 { font-size: 1.125rem; color: var(--text-main); line-height: 1.2; }
        .header-left p { font-size: 0.8125rem; color: var(--text-muted); }

        .close-btn { color: var(--text-muted); padding: 0.5rem; }
        .close-btn:hover { color: var(--text-main); }

        .modal-content { padding: 2rem; }

        .status-summary {
          padding: 1.25rem;
          border-radius: var(--radius-md);
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-label { display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; }
        .status-date { font-size: 0.75rem; font-weight: 600; opacity: 0.8; }

        .status-box-pending { background: #FFF9E6; color: #B27B16; border: 1px solid #FFEBB3; }
        .status-box-approved { background: #E6F9EC; color: #168039; border: 1px solid #B3ECC3; }
        .status-box-rejected { background: #FCE8E8; color: #C53030; border: 1px solid #F8B3B3; }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .info-group label { margin-bottom: 0.25rem; font-size: 0.7rem; display: flex; align-items: center; gap: 0.5rem; }
        .info-val { font-weight: 700; color: var(--text-main); font-size: 1rem; }
        .highlight-val { color: var(--primary); font-size: 1.25rem; }

        .obs-section {
          background: #FAFBFC;
          padding: 1.5rem;
          border-radius: var(--radius-md);
          margin-bottom: 2rem;
        }
        .obs-section label { margin-bottom: 0.75rem; }
        .obs-section p { font-size: 0.9375rem; color: var(--text-main); }

        .attachment-preview { margin-bottom: 2rem; }
        .file-card {
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-top: 0.5rem;
        }

        .file-info { flex: 1; display: flex; flex-direction: column; }
        .file-name { font-weight: 700; color: var(--text-main); font-size: 0.875rem; }
        .file-size { font-size: 0.75rem; color: var(--text-muted); }

        .rejection-reason-box {
          background: rgba(255, 59, 48, 0.05);
          border-left: 4px solid var(--danger);
          padding: 1.5rem;
          border-radius: var(--radius-sm);
        }
        .rejection-reason-box h4 { color: var(--danger); font-size: 0.875rem; margin-bottom: 0.5rem; text-transform: uppercase; }
        .rejection-reason-box p { color: var(--text-main); font-size: 0.9375rem; font-weight: 500; }

        .reject-interaction { margin-top: 1rem; border-top: 1.5px dashed var(--border); padding-top: 1.5rem; }
        .reject-interaction textarea { margin-top: 0.75rem; background: #fff; }
        .interaction-actions { display: flex; gap: 1rem; margin-top: 1.25rem; }

        .modal-footer {
          padding: 1.5rem 2rem;
          border-top: 1px solid var(--border);
          display: flex;
          gap: 1.5rem;
          background: #FAFBFC;
        }

        .modal-footer button { flex: 1; height: 50px; }

        .success-bg { background-color: var(--success); }
        .success-bg:hover { background-color: #2fb14e; }
        .danger-bg { background-color: var(--danger); }
        .danger-text { color: var(--danger); border-color: var(--danger); }

        .storage-files-container {
          background: #FAFBFC;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          margin-top: 0.5rem;
        }
        
        .files-grid-mini {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .file-item-mini {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #eee;
        }

        .mini-icon { font-size: 1.25rem; }
        .mini-info { flex: 1; min-width: 0; }
        .mini-info span { 
          display: block; 
          font-size: 0.8125rem; 
          font-weight: 600; 
          color: var(--text-main);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .mini-download {
          color: var(--text-muted);
          padding: 0.4rem;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .mini-download:hover { background: #f0f0f0; color: var(--primary); }

        .loading-files, .no-files { font-size: 0.8125rem; color: var(--text-muted); text-align: center; padding: 1rem; }

        .sm-btn { padding: 0.5rem 1rem; font-size: 0.75rem; }

        @media (max-width: 480px) {
          .info-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
};

export default InvoiceDetailModal;
