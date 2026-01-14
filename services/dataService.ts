
import { DashboardData, FunnelStage, ClientLead, CreativePlayback } from '../types';
import { supabase } from './supabase';

export const parseNumeric = (val: any): number => {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === 'number') return val;
  
  let s = val.toString().replace(/[R$\sBRL]/g, '').trim();
  
  while (s.length > 0 && !/[0-9]/.test(s.slice(-1))) {
    s = s.slice(0, -1).trim();
  }
  
  if (!s) return 0;

  if (s.includes(',') && s.includes('.')) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (s.includes(',')) {
    const parts = s.split(',');
    if (parts[parts.length - 1].length <= 2) {
      s = s.replace(',', '.');
    } else {
      s = s.replace(',', '');
    }
  } else if (s.includes('.')) {
    const parts = s.split('.');
    if (parts[parts.length - 1].length > 2) {
      s = s.replace(/\./g, '');
    }
  }
  
  const num = parseFloat(s);
  return isNaN(num) ? 0 : num;
};

const normalizeStr = (s: string) => s.toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
  .replace(/[\s_]/g, '');

const findValue = (row: any, keys: string[]) => {
  if (!row) return null;
  const rowKeys = Object.keys(row);
  
  for (const key of keys) {
    const normalizedSearchKey = normalizeStr(key);
    const found = rowKeys.find(rk => {
      const normalizedRowKey = normalizeStr(rk);
      return normalizedRowKey === normalizedSearchKey || normalizedRowKey.includes(normalizedSearchKey);
    });
    if (found && row[found] !== null && row[found] !== "" && row[found] !== undefined) {
      return row[found];
    }
  }
  return null;
};

const PREFERRED_ORDER = [
  "entrada do lead",
  "qualificado",
  "mensagem inicial",
  "tentativa de contato",
  "em atendimento",
  "lead futuro",
  "pre agendamento",
  "reuniao agendada",
  "reuniao realizada",
  "proposta enviada",
  "vendas concluidas"
];

const generateColor = (name: string): string => {
  const n = normalizeStr(name);
  if (n.includes("venda") || n.includes("concluid")) return '#10b981'; 
  const idx = PREFERRED_ORDER.findIndex(term => n.includes(normalizeStr(term)));
  if (idx === -1) return '#94a3b8';
  return `hsl(214, 66%, ${Math.max(25, 85 - (idx * (50 / PREFERRED_ORDER.length)))}%)`;
};

export const processSupabaseData = (rows: any[], fetchedTables: string[] = [], rawDataByTable: Record<string, any[]> = {}): DashboardData => {
  let totalUnits = 0;
  let totalVGV = 0;
  let projectName = "Even Digital";
  
  let totalSpend = 0; 
  let totalMarketingLeads = 0;
  let totalReach = 0;
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalSalesValue = 0; 
  let countVendasID14 = 0;
  
  const stageCounts: Record<string, number> = {};
  PREFERRED_ORDER.forEach(stage => {
    const officialName = stage.charAt(0).toUpperCase() + stage.slice(1);
    stageCounts[officialName] = 0;
  });

  const leadsList: ClientLead[] = [];
  const creativeMap: Record<string, CreativePlayback> = {};
  
  let sumFreq = 0;
  let countFreqRows = 0;

  // Filtramos os dados recebidos (já filtrados pelo frontend) por finalidade
  const marketingRows = rows.filter(r => findValue(r, ["Amount Spent", "investimento", "leads", "results"]));
  const salesRows = rows.filter(r => findValue(r, ["Nome Etapa", "etapa", "Status"]));
  const dadosRows = rows.filter(r => findValue(r, ["VGV", "unidades"]));

  const infoSource = dadosRows.length > 0 ? dadosRows : rows;
  for (let i = infoSource.length - 1; i >= 0; i--) {
    const row = infoSource[i];
    const u = findValue(row, ["unidades", "total unidades", "units", "quantidade"]);
    const valU = parseNumeric(u);
    if (valU > 0 && totalUnits === 0) totalUnits = valU;

    const v = findValue(row, ["VGV", "valor geral vendas", "vgv total", "valor"]);
    const valV = parseNumeric(v);
    if (valV > 0 && totalVGV === 0) totalVGV = valV;

    const name = findValue(row, ["nome do empreendimento", "projeto", "empreendimento", "client"]);
    if (name && projectName === "Even Digital") projectName = name;
  }

  marketingRows.forEach((row) => {
    const spend = parseNumeric(findValue(row, ["Amount Spent", "investimento", "valor gasto", "spent"]));
    totalSpend += spend;
    
    const leads = parseNumeric(findValue(row, ["leads", "lead count", "leads_gerados", "results", "resultados"]));
    totalMarketingLeads += leads;

    totalReach += parseNumeric(findValue(row, ["Reach", "Alcance"]));
    totalImpressions += parseNumeric(findValue(row, ["Impressions", "Impressoes"]));
    totalClicks += parseNumeric(findValue(row, ["Link Clicks", "Cliques", "Clicks"]));

    const freq = parseNumeric(findValue(row, ["Frequency", "Frequencia"]));
    if (freq > 0) {
      sumFreq += freq;
      countFreqRows++;
    }

    const adName = findValue(row, ["Ad Name", "Nome do Anuncio", "ad_name", "Anúncio"]) || "Sem Nome";
    const dateValue = findValue(row, ["Date", "Day", "dia", "data", "created_at"]) || "";
    
    if (!creativeMap[adName]) {
      creativeMap[adName] = { adName, views3s: 0, p25: 0, p50: 0, p75: 0, p95: 0, p100: 0, retentionRate: 0, date: String(dateValue) };
    }
    creativeMap[adName].p100 += leads;
  });

  const creativePlayback: CreativePlayback[] = Object.values(creativeMap)
    .sort((a, b) => b.p100 - a.p100);

  salesRows.forEach((row, index) => {
    const stageNameRaw = findValue(row, ["Nome Etapa", "Status", "etapa", "fase"]);
    const stageIdRaw = findValue(row, ["ID Etapa", "Etapa ID", "id_etapa"]);
    const stageId = stageIdRaw ? String(stageIdRaw).trim() : "";
    const stageName = stageNameRaw ? String(stageNameRaw).trim() : "";
    const stageNorm = normalizeStr(stageName);

    const isVendaConcluida = stageId === "14" || stageNorm.includes("vendasconcluidas") || stageNorm.includes("vendasconcluida");

    if (isVendaConcluida) {
      const rowVal = parseNumeric(findValue(row, ["valor", "venda"]));
      const rowQty = parseNumeric(findValue(row, ["quantidade", "units"]));
      const multiplier = rowQty > 0 ? rowQty : 1;
      totalSalesValue += (rowVal * multiplier);
      countVendasID14++;
      stageCounts["Vendas concluidas"]++;
    } else if (stageName) {
      const matchedStage = PREFERRED_ORDER.find(term => stageNorm.includes(normalizeStr(term)));
      if (matchedStage) {
        const officialName = matchedStage.charAt(0).toUpperCase() + matchedStage.slice(1);
        stageCounts[officialName]++;
      }
    }

    const leadName = findValue(row, ["nome", "cliente", "lead"]);
    if (leadName) {
      leadsList.push({
        id: `lead-${index}-${Math.random()}`,
        name: String(leadName),
        email: String(findValue(row, ["email"]) || "---"),
        phone: String(findValue(row, ["telefone", "phone"]) || "---"),
        businessTitle: "---",
        pipeline: "Padrão",
        stage: stageName,
        date: String(findValue(row, ["data", "created_at"]) || "---")
      });
    }
  });

  return {
    metrics: {
      totalRevenue: totalSalesValue,
      revenuePerUnitManaged: totalUnits > 0 ? totalVGV / totalUnits : 0,
      unitsSoldPerWeek: 0,
      preLaunchSoldRatio: 0,
      conversionRateLeadToSale: 0,
      qualifiedLeadRatio: 0,
      cac: totalMarketingLeads > 0 ? totalSpend / totalMarketingLeads : 0,
      totalUnitsSold: countVendasID14,
      totalLeads: leadsList.length,
      totalSpend: totalSpend,
      marketingMetrics: { 
        cpm: totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0, 
        ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0, 
        cpc: totalClicks > 0 ? totalSpend / totalClicks : 0, 
        frequency: countFreqRows > 0 ? sumFreq / countFreqRows : 1, 
        cpl: totalMarketingLeads > 0 ? totalSpend / totalMarketingLeads : 0, 
        reach: totalReach,
        impressions: totalImpressions,
        clicks: totalClicks,
        platformLeads: totalMarketingLeads,
        landingPageConvRate: 0 
      },
      salesMetrics: { avgResponseTime: 'N/A', totalBilling: 0, generalConvRate: 0 }
    },
    clientInfo: { projectName, totalUnits, vgv: totalVGV, weeksOperation: 1 },
    salesTrend: [],
    funnelData: PREFERRED_ORDER.map(term => ({
      stage: term.charAt(0).toUpperCase() + term.slice(1),
      count: stageCounts[term.charAt(0).toUpperCase() + term.slice(1)] || 0,
      color: generateColor(term)
    })),
    leadsList,
    adsTrend: [],
    creativePlayback,
    dataSource: rows.length > 0 ? 'supabase' : 'fallback',
    rawSample: rows,
    fetchedTables,
    rawDataByTable
  };
};

export const fetchData = async (tableNames: string[]): Promise<{ data: DashboardData, error?: string }> => {
  try {
    const rawDataByTable: Record<string, any[]> = {};
    const successfulTables: string[] = [];
    const allRows: any[] = [];
    
    await Promise.all(tableNames.map(async (table) => {
      const formattedName = table.includes(' ') ? `"${table}"` : table;
      const { data, error } = await supabase.from(formattedName).select('*');
      if (!error && data) {
        rawDataByTable[table] = data;
        successfulTables.push(table);
        allRows.push(...data);
      }
    }));

    return { data: processSupabaseData(allRows, successfulTables, rawDataByTable) };
  } catch (err: any) {
    return { data: processSupabaseData([], [], {}), error: err.message };
  }
};