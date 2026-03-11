
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://btsyvpoelshucpsaaolz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0c3l2cG9lbHNodWNwc2Fhb2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTQ0MzQsImV4cCI6MjA4NzUzMDQzNH0.1o-wfmqK3uhAyhEX4qxHlThc7_fXXcvohu5myLg6xPw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkNF() {
    const { error } = await supabase
        .from('Nota fiscal')
        .insert([{
            data_emissao: '2024-02-27',
            numero_nf: 'NF-123', // Teste com letras
            nome_fornecedor: 'Teste NF',
            cnpj: "12345678000199",
            valor: 100,
            centro_custo: 'Operacional',
            obra: 'Teste',
            pasta: 'https://teste.com',
            fluxo: 'enviado'
        }]);

    if (error) {
        console.error('ERRO NO NUMERO_NF:', error.message);
    } else {
        console.log('SUCESSO COM NF COM LETRAS!');
        await supabase.from('Nota fiscal').delete().eq('numero_nf', 'NF-123');
    }
}

checkNF();
