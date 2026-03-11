import { useState, useMemo } from 'react';
import { useInvoices } from '../context/InvoiceContext';
import {
  Eye,
  Search,
  Filter,
  Calendar,
  Building,
  MoreVertical,
  ArrowUpDown,
  X,
  ChevronDown,
  LayoutGrid,
  MapPin,
  Tag
} from 'lucide-react';

const InvoiceList = ({ role, onDetailClick, forceStatus = null, selectable = false, onSelectionChange = null }) => {
  const { invoices } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectFilter, setProjectFilter] = useState('todos');
  const [costCenterFilter, setCostCenterFilter] = useState('todos');

  // Derive unique lists for filters
  const projects = useMemo(() => ['todos', ...new Set(invoices.map(i => i.project))], [invoices]);
  const costCenters = useMemo(() => ['todos', ...new Set(invoices.map(i => i.costCenter))], [invoices]);

  const activeStatusFilter = forceStatus || statusFilter;

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Basic Search
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        inv.supplier.toLowerCase().includes(term) ||
        inv.number.toLowerCase().includes(term) ||
        inv.project.toLowerCase().includes(term);

      // Status Filter
      const matchesStatus = activeStatusFilter === 'todos' || inv.status === activeStatusFilter;

      // Project & Cost Center
      const matchesProject = projectFilter === 'todos' || inv.project === projectFilter;
      const matchesCostCenter = costCenterFilter === 'todos' || inv.costCenter === costCenterFilter;

      // Date Range
      let matchesDate = true;
      if (startDate || endDate) {
        const invDate = new Date(inv.date);
        if (startDate && invDate < new Date(startDate)) matchesDate = false;
        if (endDate && invDate > new Date(endDate)) matchesDate = false;
      }

      return matchesSearch && matchesStatus && matchesProject && matchesCostCenter && matchesDate;
    });
  }, [invoices, searchTerm, activeStatusFilter, projectFilter, costCenterFilter, startDate, endDate]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setStartDate('');
    setEndDate('');
    setProjectFilter('todos');
    setCostCenterFilter('todos');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'todos' || startDate || endDate || projectFilter !== 'todos' || costCenterFilter !== 'todos';

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0) {
      setSelectedIds([]);
      if (onSelectionChange) onSelectionChange([]);
    } else {
      const allIds = filteredInvoices.map(i => i.id);
      setSelectedIds(allIds);
      if (onSelectionChange) onSelectionChange(allIds);
    }
  };

  const toggleSelectOne = (id) => {
    let newSelection;
    if (selectedIds.includes(id)) {
      newSelection = selectedIds.filter(sid => sid !== id);
    } else {
      newSelection = [...selectedIds, id];
    }
    setSelectedIds(newSelection);
    if (onSelectionChange) onSelectionChange(newSelection);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pendente': return <span className="status-pill status-pending"><span className="dot"></span> Pendente</span>;
      case 'aprovada': return <span className="status-pill status-approved"><span className="dot"></span> Aprovada</span>;
      case 'rejeitada': return <span className="status-pill status-rejected"><span className="dot"></span> Rejeitada</span>;
      default: return null;
    }
  };

  return (
    <div className="list-wrapper animate-fade">
      <div className="glass-header">
        <div className="list-controls">
          <div className="search-group">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por fornecedor, NF ou obra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="modern-input"
            />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="clear-search"><X size={14} /></button>}
          </div>

          <div className="actions-group">
            <button
              className={`filter-toggle ${showAdvanced || hasActiveFilters ? 'active' : ''}`}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter size={18} />
              <span>Filtros {hasActiveFilters && '(Ativos)'}</span>
              <ChevronDown size={14} className={showAdvanced ? 'rotate' : ''} />
            </button>

            {hasActiveFilters && (
              <button className="btn-clear-all" onClick={clearFilters}>
                Limpar Tudo
              </button>
            )}
          </div>
        </div>

        {showAdvanced && (
          <div className="advanced-filters-panel animate-slide-down">
            <div className="filters-grid">
              {!forceStatus && (
                <div className="filter-item">
                  <label><LayoutGrid size={14} /> Status</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="todos">Todos os Status</option>
                    <option value="pendente">⏳ Pendentes</option>
                    <option value="aprovada">✅ Aprovadas</option>
                    <option value="rejeitada">❌ Rejeitadas</option>
                  </select>
                </div>
              )}

              <div className="filter-item">
                <label><MapPin size={14} /> Obra / Projeto</label>
                <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                  {projects.map(p => (
                    <option key={p} value={p}>{p === 'todos' ? 'Todos os Projetos' : p}</option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <label><Tag size={14} /> Centro de Custo</label>
                <select value={costCenterFilter} onChange={(e) => setCostCenterFilter(e.target.value)}>
                  {costCenters.map(c => (
                    <option key={c} value={c}>{c === 'todos' ? 'Todos os Centros' : c}</option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <label><Calendar size={14} /> Período (Início)</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              <div className="filter-item">
                <label><Calendar size={14} /> Período (Fim)</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="table-card card">
        <div className="table-header">
          <div className="header-left">
            <h2>
              {forceStatus === 'pendente' ? 'Fila de Auditoria' :
                forceStatus === 'aprovada' ? 'Fluxo Financeiro' :
                  'Histórico Operacional'}
            </h2>
            <div className="status-indicative">
              <span className="pulse-dot"></span>
              Atualizado em tempo real
            </div>
          </div>
          <span className="count-badge">{filteredInvoices.length} notas</span>
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                {selectable && (
                  <th style={{ width: '40px' }}>
                    <div className="checkbox-container">
                      <input
                        type="checkbox"
                        className="checkbox-custom"
                        checked={filteredInvoices.length > 0 && selectedIds.length === filteredInvoices.length}
                        onChange={toggleSelectAll}
                      />
                    </div>
                  </th>
                )}
                <th>NF</th>
                <th>Fornecedor</th>
                <th>Obra / Projeto</th>
                <th>Emissão</th>
                <th>Valor Bruto</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={selectable ? 8 : 7} className="empty-state-cell">
                    <div className="empty-state">
                      <div className="empty-illustration">🔍</div>
                      <h3>Nenhum resultado encontrado</h3>
                      <p>Tente ajustar seus filtros ou termos de pesquisa para encontrar o que procura.</p>
                      <button onClick={clearFilters} className="btn-secondary sm">Redefinir Filtros</button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className={`table-row ${selectedIds.includes(inv.id) ? 'selected' : ''}`}
                    onClick={() => onDetailClick(inv)}
                  >
                    {selectable && (
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            className="checkbox-custom"
                            checked={selectedIds.includes(inv.id)}
                            onChange={() => toggleSelectOne(inv.id)}
                          />
                        </div>
                      </td>
                    )}
                    <td><span className="nf-tag">#{inv.number}</span></td>
                    <td>
                      <div className="supplier-info">
                        <div className="avatar-mini">{inv.supplier.charAt(0)}</div>
                        <div className="text-container">
                          <span className="name">{inv.supplier}</span>
                          <span className="cnpj-sub">{inv.cnpj}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="project-cell">
                        <span className="project-name">{inv.project}</span>
                        <span className="cost-center-tag">{inv.costCenter}</span>
                      </div>
                    </td>
                    <td><span className="date-cell">{new Date(inv.date).toLocaleDateString('pt-BR')}</span></td>
                    <td><span className="amount-cell">{inv.amount}</span></td>
                    <td>{getStatusBadge(inv.status)}</td>
                    <td className="text-right">
                      <div className="actions-wrapper">
                        <button className="action-circle-btn" title="Ver detalhes">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .list-wrapper { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; }
        
        /* Glass Header Section */
        .glass-header {
          background: white;
          border-radius: 20px;
          border: 1px solid var(--border);
          padding: 1.25rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .list-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .search-group {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 1.25rem;
          color: #94a3b8;
          transition: color 0.2s;
        }

        .modern-input {
          width: 100%;
          padding: 0.85rem 3rem 0.85rem 3.25rem !important;
          background: #f8fafc;
          border: 1.5px solid transparent;
          border-radius: 14px;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .modern-input:focus {
          background: white;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(193, 18, 31, 0.05);
        }

        .modern-input:focus + .search-icon { color: var(--primary); }

        .clear-search {
          position: absolute;
          right: 1.25rem;
          color: #94a3b8;
          padding: 4px;
          border-radius: 50%;
        }
        .clear-search:hover { background: #e2e8f0; color: #475569; }

        .actions-group { display: flex; align-items: center; gap: 1rem; }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          background: white;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          color: var(--text-main);
          font-weight: 700;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .filter-toggle:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .filter-toggle.active {
          background: rgba(193, 18, 31, 0.05);
          border-color: var(--primary);
          color: var(--primary);
        }

        .btn-clear-all {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--primary);
          background: none;
          padding: 0.5rem 0;
          border-bottom: 2px solid transparent;
        }
        .btn-clear-all:hover { border-bottom-color: var(--primary); }

        .rotate { transform: rotate(180deg); transition: transform 0.3s; }

        /* Advanced Filters Panel */
        .advanced-filters-panel {
          margin-top: 1.25rem;
          padding-top: 1.25rem;
          border-top: 1px dashed var(--border);
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
        }

        .filter-item { display: flex; flex-direction: column; gap: 0.5rem; }
        .filter-item label { 
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.02em;
        }

        .filter-item select, .filter-item input {
          background: #f8fafc;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          padding: 0.65rem 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-main);
          transition: all 0.2s;
        }

        .filter-item select:focus, .filter-item input:focus { border-color: var(--primary); background: white; }

        /* Table Card Section */
        .table-card { padding: 0 !important; overflow: hidden; border: 1px solid var(--border); box-shadow: 0 10px 30px rgba(0,0,0,0.03); }

        .table-header {
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          border-bottom: 1px solid var(--border);
        }

        .header-left { display: flex; flex-direction: column; gap: 0.25rem; }
        .header-left h2 { font-size: 1.25rem; color: #0f172a; font-weight: 800; }
        
        .status-indicative { 
          display: flex; align-items: center; gap: 0.5rem; 
          font-size: 0.75rem; font-weight: 600; color: #64748b; 
        }

        .pulse-dot {
          width: 8px; height: 8px; background: #34c759; border-radius: 50%;
          box-shadow: 0 0 0 rgba(52, 199, 89, 0.4);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(52, 199, 89, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(52, 199, 89, 0); }
          100% { box-shadow: 0 0 0 0 rgba(52, 199, 89, 0); }
        }

        .count-badge {
          background: #f1f5f9;
          padding: 0.4rem 1rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 800;
          color: #475569;
        }

        .table-responsive { overflow-x: auto; }
        .modern-table { width: 100%; border-collapse: collapse; text-align: left; }

        .modern-table th {
          padding: 1rem 2rem;
          background: #f8fafc;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #64748b;
          border-bottom: 1px solid var(--border);
          letter-spacing: 0.05em;
        }

        .table-row {
          cursor: pointer;
          transition: all 0.2s;
        }

        .table-row:hover { background: #f8fafc; }
        .table-row.selected { background: rgba(193, 18, 31, 0.03); }
        .table-row.selected:hover { background: rgba(193, 18, 31, 0.05); }

        .modern-table td { padding: 1.25rem 2rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

        .nf-tag {
          font-family: 'JetBrains Mono', monospace;
          background: #f1f5f9;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.8125rem;
          color: #475569;
        }

        .supplier-info { display: flex; align-items: center; gap: 1rem; }
        .avatar-mini {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 0.875rem; color: #1e293b;
          border: 1px solid var(--border);
        }

        .text-container { display: flex; flex-direction: column; }
        .text-container .name { font-weight: 700; color: #0f172a; font-size: 0.9375rem; }
        .text-container .cnpj-sub { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }

        .project-cell { display: flex; flex-direction: column; gap: 0.25rem; }
        .project-name { font-weight: 700; color: #334155; font-size: 0.875rem; }
        .cost-center-tag { 
          font-size: 0.65rem; font-weight: 800; text-transform: uppercase; 
          color: #94a3b8; letter-spacing: 0.02em;
        }

        .amount-cell { font-weight: 800; color: var(--primary); font-size: 1rem; }
        .date-cell { font-weight: 600; color: #64748b; font-size: 0.8125rem; }

        .status-pill {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 1rem; border-radius: 10px; font-size: 0.75rem; font-weight: 800;
          text-transform: uppercase;
        }

        .status-pill .dot { width: 6px; height: 6px; border-radius: 50%; }

        .status-pending { background: #fffcf0; color: #b45309; }
        .status-pending .dot { background: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.4); }

        .status-approved { background: #f0fdf4; color: #15803d; }
        .status-approved .dot { background: #22c55e; box-shadow: 0 0 10px rgba(34, 197, 94, 0.4); }

        .status-rejected { background: #fef2f2; color: #b91c1c; }
        .status-rejected .dot { background: #ef4444; box-shadow: 0 0 10px rgba(239, 68, 68, 0.4); }

        .action-circle-btn {
          width: 38px; height: 38px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: white; border: 1px solid var(--border);
          color: #94a3b8; transition: all 0.2s;
        }
        .action-circle-btn:hover { background: #f8fafc; color: var(--primary); border-color: var(--primary); transform: scale(1.1); }

        /* Checkbox Styling */
        .checkbox-container { display: flex; align-items: center; justify-content: center; }
        .checkbox-custom {
          width: 20px; height: 20px; cursor: pointer;
          accent-color: var(--primary);
        }

        /* Empty State */
        .empty-state-cell { padding: 0 !important; }
        .empty-state {
          padding: 6rem 2rem;
          display: flex; flex-direction: column; align-items: center;
          text-align: center; gap: 1rem;
          color: #94a3b8;
        }
        .empty-illustration { font-size: 4rem; margin-bottom: 1rem; opacity: 0.5; }
        .empty-state h3 { color: #1e293b; font-size: 1.25rem; }
        .empty-state p { max-width: 320px; line-height: 1.5; font-size: 0.9375rem; }

        @media (max-width: 1024px) {
          .list-controls { flex-direction: column; align-items: stretch; }
          .actions-group { justify-content: space-between; }
        }
      `}</style>
    </div>
  );
};

export default InvoiceList;
