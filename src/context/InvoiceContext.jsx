import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const InvoiceContext = createContext();

export const InvoiceProvider = ({ children }) => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchInvoices = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            let query = supabase
                .from('Nota fiscal')
                .select('*');

            if (user.role === 'engineer' || user.role === 'analyst') {
                query = query.in('fluxo', ['pendente', 'aprovada', 'rejeitada']);
            } else if (user.role === 'admin') {
                query = query.in('fluxo', ['aprovada', 'rejeitada']);
            }

            const { data, error } = await query.order('id', { ascending: false });

            if (error) throw error;

            const mapped = data.map(inv => ({
                id: inv.id,
                number: inv.numero_nf,
                supplier: inv.nome_fornecedor,
                cnpj: inv.cnpj,
                date: inv.data_emissao,
                amount: `R$ ${(typeof inv.valor === 'number' ? inv.valor : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                amountRaw: inv.valor,
                costCenter: inv.centro_custo,
                project: inv.obra,
                observations: inv.observacoes,
                status: inv.fluxo,
                pasta: inv.pasta,
                timestamp: inv.created_at || new Date().toISOString(),
                engineer: 'Engenheiro',
            }));

            setInvoices(mapped);
        } catch (err) {
            console.error('Error fetching invoices:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;

        // Chamada inicial
        fetchInvoices();

        // Configurar Realtime para atualizacao automatica (INSERT, UPDATE, DELETE)
        const channel = supabase
            .channel('db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'Nota fiscal'
                },
                () => {
                    console.log('Mudança detectada no banco! Atualizando lista...');
                    fetchInvoices();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, fetchInvoices]);

    const addInvoice = async (invoiceData) => {
        if (!user) return;

        try {
            let amountNum = 0;
            if (typeof invoiceData.amount === 'number') {
                amountNum = invoiceData.amount;
            } else if (typeof invoiceData.amount === 'string') {
                amountNum = parseFloat(invoiceData.amount.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
            }

            const cleanCNPJ = String(invoiceData.cnpj || '').replace(/\D/g, '') || null;
            const cleanNumber = String(invoiceData.number || '').replace(/\D/g, '') || null;

            const newDbInvoice = {
                data_emissao: invoiceData.date,
                numero_nf: cleanNumber,
                nome_fornecedor: invoiceData.supplier,
                cnpj: cleanCNPJ,
                valor: amountNum,
                centro_custo: invoiceData.costCenter,
                obra: invoiceData.project,
                pasta: invoiceData.pasta,
                observacoes: invoiceData.observations,
                fluxo: 'pendente'
            };

            const { error } = await supabase
                .from('Nota fiscal')
                .insert([newDbInvoice]);

            if (error) {
                console.error('Supabase Insert Error:', error);
                throw error;
            }

            await fetchInvoices();
            return { success: true };
        } catch (err) {
            console.error('Error in addInvoice:', err);
            throw err;
        }
    };

    const updateInvoiceStatus = async (id, status) => {
        try {
            const { data, error } = await supabase
                .from('Nota fiscal')
                .update({
                    fluxo: status
                })
                .eq('id', id)
                .select();

            if (error) throw error;

            await fetchInvoices();

            return { success: true };
        } catch (err) {
            console.error('Error in updateInvoiceStatus:', err);
            throw err;
        }
    };

    const updateBulkInvoicesStatus = async (ids, status) => {
        try {
            const { error } = await supabase
                .from('Nota fiscal')
                .update({ fluxo: status })
                .in('id', ids);

            if (error) throw error;

            await fetchInvoices();
            return { success: true };
        } catch (err) {
            console.error('Error in updateBulkInvoicesStatus:', err);
            throw err;
        }
    };

    return (
        <InvoiceContext.Provider value={{ invoices, loading, addInvoice, updateInvoiceStatus, updateBulkInvoicesStatus, refreshInvoices: fetchInvoices }}>
            {children}
        </InvoiceContext.Provider>
    );
};

export const useInvoices = () => useContext(InvoiceContext);
