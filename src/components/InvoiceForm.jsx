import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useInvoices } from '../context/InvoiceContext';
import { useAuth } from '../context/AuthContext';
import { Send, FileUp, ClipboardList, Building, DollarSign, Calendar, Hash, FileText } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const InvoiceForm = ({ onSuccess }) => {
    const { addInvoice } = useInvoices();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        number: '',
        supplier: '',
        cnpj: '',
        date: '',
        amount: '',
        costCenter: '',
        project: '',
        observations: '',
        pasta: '',
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    // Mask helpers
    const maskCNPJ = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .substring(0, 18);
    };

    const maskBRL = (value) => {
        let clean = value.replace(/\D/g, '');
        let number = (parseFloat(clean) / 100).toFixed(2);
        if (isNaN(number)) return '';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(number);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let maskedValue = value;

        if (name === 'cnpj') maskedValue = maskCNPJ(value);
        if (name === 'amount') maskedValue = maskBRL(value);

        setFormData(prev => ({ ...prev, [name]: maskedValue }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedFiles.length === 0) {
            showToast('Por favor, anexe os documentos da nota.', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Gerar um nome de pasta único
            const folderName = `NF_${formData.number.replace(/\D/g, '')}_${Date.now()}`;
            let uploadedUrls = [];

            // 2. Fazer upload de cada arquivo
            for (const file of selectedFiles) {
                const filePath = `${folderName}/${file.name}`;
                const { data, error: uploadError } = await supabase.storage
                    .from('nuvem')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                // Pegar a URL pública (O bucket deve estar configurado como público no Supabase)
                const { data: { publicUrl } } = supabase.storage
                    .from('nuvem')
                    .getPublicUrl(filePath);

                uploadedUrls.push(publicUrl);
            }

            // 3. Salvar o registro no banco com o "link da pasta" 
            // Como o Supabase não tem uma "página de pasta" nativa, vamos salvar o caminho base
            // ou o link do primeiro arquivo, mas o ideal é que o analista veja todos.
            // Para este teste, enviaremos o link interno que usaremos no modal depois.

            const result = await addInvoice({
                ...formData,
                pasta: `supabase://nuvem/${folderName}`, // Formato interno para identificarmos no modal
                engineer: user?.name || 'Desconhecido'
            });

            setIsSubmitting(false);
            showToast('Nota Fiscal e arquivos enviados com sucesso!', 'success');
            setFormData({
                number: '', supplier: '', cnpj: '', date: '', amount: '', costCenter: '', project: '', observations: '', pasta: ''
            });
            setSelectedFiles([]);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('ERRO NO UPLOAD/SUBMIT:', err);
            setIsSubmitting(false);
            showToast(`Erro no envio: ${err.message}`, 'error');
        }
    };

    return (
        <div className="form-card card animate-fade">
            <header className="form-header">
                <div className="header-icon">
                    <FileText size={24} />
                </div>
                <div className="header-text">
                    <h2>Submissão de Nota Fiscal</h2>
                    <p>Informe os dados técnicos e financeiros da nota para processamento.</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="invoice-form">
                <div className="form-section">
                    <h3><Hash size={18} /> Dados Identificadores</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Número da NF</label>
                            <input name="number" value={formData.number} onChange={handleChange} placeholder="000.000" required />
                        </div>

                        <div className="form-group">
                            <label>Data de Emissão</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3><Building size={18} /> Detalhes do Fornecedor</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Nome do Fornecedor</label>
                            <input name="supplier" value={formData.supplier} onChange={handleChange} placeholder="Razão Social" required />
                        </div>

                        <div className="form-group">
                            <label>CNPJ</label>
                            <input name="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" required />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3><DollarSign size={18} /> Classificação Financeira</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Valor Total</label>
                            <input name="amount" value={formData.amount} onChange={handleChange} placeholder="R$ 0,00" required className="highlight-input" />
                        </div>

                        <div className="form-group">
                            <label>Centro de Custo</label>
                            <select name="costCenter" value={formData.costCenter} onChange={handleChange} required>
                                <option value="">Selecione...</option>
                                <option value="Administrativo">🏢 Administrativo</option>
                                <option value="Operacional">🏗️ Operacional</option>
                                <option value="Logística">🚚 Logística</option>
                                <option value="Ventas">📈 Vendas</option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label>Obra / Projeto Correspondente</label>
                            <select name="project" value={formData.project} onChange={handleChange} required>
                                <option value="">Selecione a obra...</option>
                                <option value="Residencial Miramar">🌅 Residencial Miramar</option>
                                <option value="Edifício Horizonte">☁️ Edifício Horizonte</option>
                                <option value="Condomínio Alpha">🏛️ Condomínio Alpha</option>
                                <option value="Loteamento Pedrosa I">🏡 Loteamento Pedrosa I</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3><FileUp size={18} /> Documentação (Anexo de Pasta de Arquivos)</h3>
                    <div className="form-group full-width">
                        <label>Arquivos da Nota (PDF, Imagens, XML)</label>
                        <div
                            className={`dropzone-sim ${selectedFiles.length > 0 ? 'has-file' : ''}`}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <input
                                type="file"
                                multiple
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden-input"
                                accept=".pdf,.jpg,.jpeg,.png,.xml"
                            />
                            <FileUp size={32} className={selectedFiles.length > 0 ? 'text-success' : 'text-muted'} />
                            <div className="dropzone-text">
                                {selectedFiles.length > 0 ? (
                                    <>
                                        <strong>{selectedFiles.length} arquivo(s) selecionado(s)</strong>
                                        <span>Clique para alterar a seleção</span>
                                    </>
                                ) : (
                                    <>
                                        <strong>Clique para selecionar os arquivos</strong>
                                        <span>Você pode selecionar vários arquivos de uma vez</span>
                                    </>
                                )}
                            </div>
                        </div>
                        {selectedFiles.length > 0 && (
                            <ul className="file-list-preview">
                                {selectedFiles.slice(0, 3).map((f, i) => (
                                    <li key={i}>{f.name}</li>
                                ))}
                                {selectedFiles.length > 3 && <li>...e mais {selectedFiles.length - 3} arquivos</li>}
                            </ul>
                        )}
                    </div>

                    <div className="form-group full-width" style={{ marginTop: '1.5rem' }}>
                        <label>Observações Gerais</label>
                        <textarea name="observations" value={formData.observations} onChange={handleChange} rows="3" placeholder="Insira aqui observações relevantes sobre esta nota..." />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            <>
                                <Send size={18} />
                                Enviar para Aprovação
                            </>
                        )}
                    </button>
                </div>
            </form>

            <style jsx>{`
        .form-card { max-width: 800px; margin: 0 auto; background: white; }
        
        .form-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 3rem;
          padding-bottom: 1.5rem;
          border-bottom: 1.5px dashed var(--border);
        }

        .header-icon {
          width: 56px;
          height: 56px;
          background: rgba(193, 18, 31, 0.08);
          color: var(--primary);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-text h2 { font-size: 1.75rem; color: var(--text-main); line-height: 1.2; }
        .header-text p { color: var(--text-muted); font-size: 0.9375rem; margin-top: 0.25rem; }

        .form-section { margin-bottom: 2.5rem; }
        .form-section h3 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1rem;
          color: var(--text-main);
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
        
        .full-width { grid-column: span 2; }

        .highlight-input {
          font-weight: 700;
          color: var(--primary);
          font-size: 1.125rem;
        }

        .dropzone-sim {
          position: relative;
          border: 2px dashed var(--border);
          border-radius: var(--radius-md);
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          background: #FAFBFC;
          cursor: pointer;
          transition: var(--transition);
          text-align: center;
        }

        .dropzone-sim.has-file {
          border-color: var(--success);
          background: rgba(52, 199, 89, 0.02);
        }

        .dropzone-sim:hover {
          border-color: var(--primary);
          background: rgba(193, 18, 31, 0.02);
        }

        .dropzone-text strong { display: block; color: var(--text-main); margin-bottom: 0.25rem; }
        .dropzone-text span { font-size: 0.75rem; color: var(--text-muted); }

        .file-list-preview {
          margin-top: 1rem;
          list-style: none;
          padding: 0;
          font-size: 0.8125rem;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .file-list-preview li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .file-list-preview li::before {
          content: '•';
          color: var(--primary);
        }

        .form-actions {
          margin-top: 3rem;
          display: flex;
          justify-content: flex-end;
          border-top: 1px solid var(--border);
          padding-top: 2rem;
        }

        .submit-btn {
          min-width: 240px;
          height: 52px;
        }

        .hidden-input { position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer; }

        @media (max-width: 640px) {
          .form-grid { grid-template-columns: 1fr; }
          .full-width { grid-column: span 1; }
        }
      `}</style>
        </div>
    );
};

export default InvoiceForm;
