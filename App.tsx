
import { 
  Moon, Sun, 
  BarChart3, Database,
  Users, Search, Mail, Phone,
  ChevronRight, X,
  Loader2, Eye, EyeOff,
  TrendingUp, Target, DollarSign, RefreshCw, Grid,
  Filter, Percent, ShoppingBag, Target as CplIcon,
  Calendar, Layers, Check,
  MousePointer2, Eye as ReachIcon, Layout,
  Save, Activity
} from 'lucide-react';
import React, { useEffect, useState, useMemo, useRef } from 'react';

import { ASSETS, FORMATTERS } from './constants';
import { fetchData, processSupabaseData, parseNumeric } from './services/dataService';
import { DashboardData, LoadingState, UserAuth, ClientLead, DashboardGoals, GoalMode, CreativePlayback } from './types';
import { FunnelChartComponent } from './components/FunnelChartComponent';
import { KPICard, KPIStatus } from './components/KPICard';
import { supabase } from './services/supabase';

const getRowValue = (row: any, possibleKeys: string[]) => {
  if (!row) return null;
  const rowKeys = Object.keys(row);
  for (const key of possibleKeys) {
    const normSearch = key.toLowerCase().replace(/[\s_]/g, '');
    const foundKey = rowKeys.find(rk => rk.toLowerCase().replace(/[\s_]/g, '') === normSearch);
    if (foundKey && row[foundKey] !== null && row[foundKey] !== undefined) return String(row[foundKey]);
  }
  return null;
};

const CAMPAIGN_KEYS = ["Campaign", "Campanha", "campaign_name", "Campaign Name"];
const ADSET_KEYS = ["Ad Set Name", "Conjunto de Anuncios", "ad_set_name", "adset_name", "Conjunto de anúncios"];
const AD_KEYS = ["Ad Name", "Nome do Anuncio", "ad_name", "Nome do anúncio", "Anúncio"];

const GoalInputCard = ({ icon: Icon, title, metricKey, goals, setGoals }: any) => (
  <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-primary/10 rounded-xl text-primary"><Icon size={20} /></div>
      <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase italic tracking-tight">{title}</h4>
    </div>
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-2 block">Valor Alvo</label>
        <input 
          type="number" 
          value={goals[metricKey].value} 
          onChange={(e) => setGoals({ ...goals, [metricKey]: { ...goals[metricKey], value: parseFloat(e.target.value) || 0 } })}
          className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white italic"
        />
      </div>
      {(metricKey === 'amountSpent' || metricKey === 'leads') && (
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-2 block">Modo de Cálculo</label>
          <div className="flex gap-2">
            {(['daily', 'monthly', 'fixed'] as GoalMode[]).map(m => (
              <button 
                key={m} 
                onClick={() => setGoals({ ...goals, [metricKey]: { ...goals[metricKey], mode: m } })}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase italic transition-all ${goals[metricKey].mode === m ? 'bg-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}
              >
                {m === 'daily' ? 'Diário' : m === 'monthly' ? 'Mensal' : 'Fixo'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('even_theme') === 'dark');
  const [loading, setLoading] = useState<LoadingState>(LoadingState.IDLE);
  const [baseData, setBaseData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'metas' | 'marketing' | 'sales'>('overview');
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('even_auth') === 'true');
  const [currentUser, setCurrentUser] = useState<UserAuth | null>(() => {
    const saved = localStorage.getItem('even_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [goals, setGoals] = useState<DashboardGoals>(() => {
    const saved = localStorage.getItem(`even_goals_${currentUser?.id || 'default'}`);
    if (saved) return JSON.parse(saved);
    return {
      amountSpent: { value: 0, mode: 'monthly' },
      leads: { value: 0, mode: 'monthly' },
      cpl: { value: 0, mode: 'fixed' },
      ctr: { value: 0, mode: 'fixed' },
      cpm: { value: 0, mode: 'fixed' },
      frequency: { value: 0, mode: 'fixed' }
    };
  });

  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [selectedAdSets, setSelectedAdSets] = useState<string[]>([]);
  const [selectedAds, setSelectedAds] = useState<string[]>([]);
  const [salesSearch, setSalesSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(LoadingState.LOADING);
    const tablesToFetch = [`Marketing_${currentUser.id}`, `Vendas_${currentUser.id}`, `Dados` ];
    const result = await fetchData(tablesToFetch);
    setBaseData(result.data);
    setLoading(LoadingState.SUCCESS);
  };

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated, currentUser?.id]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('even_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const data = useMemo(() => {
    if (!baseData?.rawDataByTable) return baseData;
    const allFilteredRows: any[] = [];
    Object.entries(baseData.rawDataByTable).forEach(([tableName, rows]) => {
      const filtered = (rows as any[]).filter(row => {
        if (selectedCampaigns.length > 0) { const val = getRowValue(row, CAMPAIGN_KEYS); if (val && !selectedCampaigns.includes(val)) return false; }
        if (selectedAdSets.length > 0) { const val = getRowValue(row, ADSET_KEYS); if (val && !selectedAdSets.includes(val)) return false; }
        if (selectedAds.length > 0) { const val = getRowValue(row, AD_KEYS); if (val && !selectedAds.includes(val)) return false; }
        if (startDate || endDate) {
          const rowDateRaw = row.Date || row.Day || row.dia || row.data || row.created_at;
          if (rowDateRaw) { const rowDate = new Date(rowDateRaw); if (startDate && rowDate < new Date(startDate)) return false; if (endDate && rowDate > new Date(endDate)) return false; }
        }
        return true;
      });
      allFilteredRows.push(...filtered);
    });
    return processSupabaseData(allFilteredRows, baseData.fetchedTables || [], baseData.rawDataByTable);
  }, [baseData, startDate, endDate, selectedCampaigns, selectedAdSets, selectedAds]);

  const scaledGoals = useMemo(() => {
    const getScaled = (metric: { value: number; mode: GoalMode }) => {
      if (!startDate || !endDate || metric.mode === 'fixed') return metric.value;
      const diffDays = Math.ceil(Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return metric.mode === 'monthly' ? (metric.value * (diffDays / 30)) : (metric.value * diffDays);
    };
    return {
      amountSpent: getScaled(goals.amountSpent),
      leads: getScaled(goals.leads),
      cpl: goals.cpl.value,
      ctr: goals.ctr.value,
      cpm: goals.cpm.value,
      frequency: goals.frequency.value
    };
  }, [goals, startDate, endDate]);

  const statusMap = useMemo(() => {
    if (!data) return {};
    const calculateStatus = (actual: number, target: number, type: 'higher-better' | 'lower-better'): KPIStatus => {
      if (target === 0) return undefined;
      const diff = (actual / target);
      if (type === 'higher-better') return diff > 1.05 ? 'BOM' : diff < 0.95 ? 'RUIM' : 'MÉDIA';
      return diff < 0.95 ? 'BOM' : diff > 1.05 ? 'RUIM' : 'MÉDIA';
    };
    return {
      amountSpent: calculateStatus(data.metrics.totalSpend, scaledGoals.amountSpent, 'lower-better'),
      leads: calculateStatus(data.metrics.totalLeads, scaledGoals.leads, 'higher-better'),
      cpl: calculateStatus(data.metrics.marketingMetrics.cpl, scaledGoals.cpl, 'lower-better'),
      ctr: calculateStatus(data.metrics.marketingMetrics.ctr, scaledGoals.ctr, 'higher-better'),
      cpm: calculateStatus(data.metrics.marketingMetrics.cpm, scaledGoals.cpm, 'lower-better'),
      frequency: calculateStatus(data.metrics.marketingMetrics.frequency, scaledGoals.frequency, 'lower-better')
    };
  }, [data, scaledGoals]);

  const filterOptions = useMemo(() => {
    if (!baseData?.rawDataByTable) return { campaigns: [], adSets: [], ads: [] };
    const mTable = Object.keys(baseData.rawDataByTable).find(k => k.toLowerCase().includes('marketing'));
    if (!mTable) return { campaigns: [], adSets: [], ads: [] };
    const rows = (baseData.rawDataByTable[mTable] as any[]);
    return {
      campaigns: Array.from(new Set(rows.map(r => getRowValue(r, CAMPAIGN_KEYS)).filter(Boolean))).sort() as string[],
      adSets: Array.from(new Set(rows.map(r => getRowValue(r, ADSET_KEYS)).filter(Boolean))).sort() as string[],
      ads: Array.from(new Set(rows.map(r => getRowValue(r, AD_KEYS)).filter(Boolean))).sort() as string[]
    };
  }, [baseData]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6 font-sans">
        <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-2xl p-12 flex flex-col items-center">
          <img src={ASSETS.LOGO} alt="Even" className="h-16 mb-6" />
          <h1 className="text-2xl font-bold text-[#1e293b] mb-1">Even Digital</h1>
          <form onSubmit={async (e) => { 
            e.preventDefault(); 
            setIsLoggingIn(true);
            const { data: userRows, error } = await supabase.from('Logins Even').select('*').eq('user', loginForm.username).eq('senha', loginForm.password).single();
            if (error || !userRows) { setLoginError('Acesso inválido.'); setIsLoggingIn(false); return; }
            const authUser: UserAuth = { id: userRows.id, username: userRows.user, role: userRows.user === 'admin' ? 'admin' : 'user' };
            localStorage.setItem('even_auth', 'true');
            localStorage.setItem('even_user', JSON.stringify(authUser));
            setCurrentUser(authUser);
            setIsAuthenticated(true);
            setIsLoggingIn(false);
          }} className="w-full space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 ml-1">Usuário</label>
              <input type="text" required className="w-full px-6 py-4 bg-[#333333] border-none rounded-xl text-sm font-medium text-white outline-none" value={loginForm.username} onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 ml-1">Senha</label>
              <input type={showPassword ? "text" : "password"} required className="w-full px-6 py-4 bg-[#333333] border-none rounded-xl text-sm font-medium text-white outline-none" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} />
            </div>
            {loginError && <div className="text-rose-500 text-xs text-center">{loginError}</div>}
            <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-bold">{isLoggingIn ? "Carregando..." : "Acessar Dashboard"}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-sans overflow-hidden">
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0 z-30">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-bold italic">E</div>
          <span className="text-xl font-black italic tracking-tighter">Even Digital</span>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          {[
            { id: 'overview', label: 'Dashboard', icon: <Grid size={18}/> },
            { id: 'marketing', label: 'Marketing', icon: <BarChart3 size={18}/> },
            { id: 'sales', label: 'Leads CRM', icon: <Users size={18}/> },
            { id: 'metas', label: 'Metas', icon: <Target size={18}/> },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-black transition-all ${activeTab === item.id ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-auto h-full custom-scrollbar">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-10 shrink-0 sticky top-0 z-20">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">{activeTab === 'overview' ? 'Visão Geral' : activeTab}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200">
               <Calendar size={16} className="text-primary" />
               <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none text-[10px] font-black outline-none" />
               <span className="text-slate-200">|</span>
               <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none text-[10px] font-black outline-none" />
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 text-slate-400 rounded-xl">{darkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
          </div>
        </header>

        <div className="p-10 space-y-10 max-w-[1600px] mx-auto w-full">
          {activeTab === 'overview' && data && (
            <div className="grid grid-cols-4 gap-8">
               <KPICard title="Investimento Mídia" value={FORMATTERS.currency(data.metrics.totalSpend)} metaValue={FORMATTERS.currency(scaledGoals.amountSpent)} icon={<DollarSign size={18}/>} statusTag={statusMap.amountSpent} inverseColors={true} />
               <KPICard title="Leads CRM" value={FORMATTERS.number(data.metrics.totalLeads)} metaValue={FORMATTERS.number(scaledGoals.leads)} icon={<Users size={18}/>} statusTag={statusMap.leads} />
               <KPICard title="VGV Vendido" value={FORMATTERS.currency(data.metrics.totalRevenue)} meta="PROJETO" metaValue="High Contorno" icon={<ShoppingBag size={18}/>} />
               <KPICard title="CPL Médio" value={FORMATTERS.currency(data.metrics.cac)} metaValue={FORMATTERS.currency(scaledGoals.cpl)} icon={<TrendingUp size={18}/>} statusTag={statusMap.cpl} />
            </div>
          )}

          {activeTab === 'metas' && (
            <div className="grid grid-cols-3 gap-8">
              <GoalInputCard icon={DollarSign} title="Gasto Mídia" metricKey="amountSpent" goals={goals} setGoals={setGoals} />
              <GoalInputCard icon={Users} title="Meta Leads" metricKey="leads" goals={goals} setGoals={setGoals} />
              <GoalInputCard icon={CplIcon} title="Meta CPL" metricKey="cpl" goals={goals} setGoals={setGoals} />
            </div>
          )}

          {activeTab === 'marketing' && data && (
            <div className="space-y-10">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-wrap gap-4">
                 <select className="bg-slate-50 p-4 rounded-xl text-xs font-black italic uppercase" value={selectedCampaigns[0] || ""} onChange={e => setSelectedCampaigns(e.target.value === "" ? [] : [e.target.value])}>
                    <option value="">Todas Campanhas</option>
                    {filterOptions.campaigns.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
                 <select className="bg-slate-50 p-4 rounded-xl text-xs font-black italic uppercase" value={selectedAdSets[0] || ""} onChange={e => setSelectedAdSets(e.target.value === "" ? [] : [e.target.value])}>
                    <option value="">Todos Conjuntos</option>
                    {filterOptions.adSets.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
                 <select className="bg-slate-50 p-4 rounded-xl text-xs font-black italic uppercase" value={selectedAds[0] || ""} onChange={e => setSelectedAds(e.target.value === "" ? [] : [e.target.value])}>
                    <option value="">Todos Anúncios</option>
                    {filterOptions.ads.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>

              <div className="grid grid-cols-5 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase italic">Leads Plataforma</p>
                  <p className="text-xl font-black italic text-primary">{FORMATTERS.number(data.metrics.marketingMetrics.platformLeads)}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase italic">Investimento</p>
                  <p className="text-xl font-black italic">{FORMATTERS.currency(data.metrics.totalSpend)}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase italic">CPL Médio</p>
                  <p className="text-xl font-black italic">{FORMATTERS.currency(data.metrics.marketingMetrics.cpl)}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase italic">CTR</p>
                  <p className="text-xl font-black italic">{FORMATTERS.percent(data.metrics.marketingMetrics.ctr)}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase italic">Frequência</p>
                  <p className="text-xl font-black italic">{data.metrics.marketingMetrics.frequency.toFixed(2)}</p>
                </div>
              </div>

              {/* TABELA SHEETS VIEW */}
              <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[700px]">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter">Relatório Técnico Granular (Sheets View)</h3>
                </div>
                <div className="overflow-auto flex-1 custom-scrollbar">
                  <table className="w-full text-left border-collapse table-fixed min-w-[2000px]">
                    <thead className="sticky top-0 z-10 bg-slate-100 border-b-2 border-slate-200">
                      <tr className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest">
                         <th className="py-5 px-6 w-32 border-r">Dia</th>
                         <th className="py-5 px-6 w-64 border-r">Nome da Campanha</th>
                         <th className="py-5 px-6 w-64 border-r">Nome do Conjunto</th>
                         <th className="py-5 px-6 w-48 border-r">Nome do Anúncio</th>
                         <th className="py-5 px-4 w-28 text-center border-r">Alcance</th>
                         <th className="py-5 px-4 w-28 text-center border-r">Impressões</th>
                         <th className="py-5 px-4 w-24 text-center border-r">Frequência</th>
                         <th className="py-5 px-4 w-32 text-center border-r">Custo p/ Res.</th>
                         <th className="py-5 px-4 w-32 text-center border-r">Investimento</th>
                         <th className="py-5 px-4 w-28 text-center border-r">CPM</th>
                         <th className="py-5 px-4 w-28 text-center border-r">Cliques no Link</th>
                         <th className="py-5 px-4 w-24 text-center border-r">CPC</th>
                         <th className="py-5 px-4 w-24 text-center border-r">CTR</th>
                         <th className="py-5 px-4 w-24 text-center border-r">CTR Único</th>
                         <th className="py-5 px-4 w-24 text-center border-r text-emerald-600">Leads</th>
                         <th className="py-5 px-4 w-28 text-center text-primary">CPL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {data.rawSample?.map((row, i) => {
                         const leads = parseNumeric(getRowValue(row, ["leads", "results"]));
                         const spend = parseNumeric(getRowValue(row, ["Amount Spent", "investimento"]));
                         const impr = parseNumeric(getRowValue(row, ["Impressions"]));
                         const clks = parseNumeric(getRowValue(row, ["Link Clicks"]));
                         return (
                           <tr key={i} className="hover:bg-slate-50">
                             <td className="py-4 px-6 text-[10px] font-bold border-r">{getRowValue(row, ["Date", "dia"])}</td>
                             <td className="py-4 px-6 text-[11px] font-black text-primary border-r truncate">{getRowValue(row, CAMPAIGN_KEYS)}</td>
                             <td className="py-4 px-6 text-[11px] font-medium border-r truncate">{getRowValue(row, ADSET_KEYS)}</td>
                             <td className="py-4 px-6 text-[11px] font-bold border-r truncate">{getRowValue(row, AD_KEYS)}</td>
                             <td className="py-4 px-4 text-center border-r">{FORMATTERS.number(parseNumeric(getRowValue(row, ["Reach"])))}</td>
                             <td className="py-4 px-4 text-center border-r">{FORMATTERS.number(impr)}</td>
                             <td className="py-4 px-4 text-center border-r">{parseNumeric(getRowValue(row, ["Frequency"])).toFixed(2)}</td>
                             <td className="py-4 px-4 text-center border-r">---</td>
                             <td className="py-4 px-4 text-center border-r">{FORMATTERS.currency(spend)}</td>
                             <td className="py-4 px-4 text-center border-r">{impr > 0 ? FORMATTERS.currency((spend/impr)*1000) : '---'}</td>
                             <td className="py-4 px-4 text-center border-r">{clks}</td>
                             <td className="py-4 px-4 text-center border-r">{clks > 0 ? FORMATTERS.currency(spend/clks) : '---'}</td>
                             <td className="py-4 px-4 text-center border-r">{impr > 0 ? ((clks/impr)*100).toFixed(2) + '%' : '---'}</td>
                             <td className="py-4 px-4 text-center border-r">---</td>
                             <td className="py-4 px-4 text-center border-r text-emerald-600 font-black">{leads}</td>
                             <td className="py-4 px-4 text-center text-primary font-black">{leads > 0 ? FORMATTERS.currency(spend/leads) : '---'}</td>
                           </tr>
                         );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;