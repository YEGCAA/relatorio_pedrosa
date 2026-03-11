
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://btsyvpoelshucpsaaolz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0c3l2cG9lbHNodWNwc2Fhb2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTQ0MzQsImV4cCI6MjA4NzUzMDQzNH0.1o-wfmqK3uhAyhEX4qxHlThc7_fXXcvohu5myLg6xPw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDecimals() {
    console.log('--- Testando Decimais em Colunas Numericas ---');

    // Testamos inserir 3333.33 na coluna valor
    const { error } = await supabase.from('Nota fiscal').insert([{
        fluxo: 'enviado',
        data_emissao: '2024-02-27',
        numero_nf: '123',
        valor: 3333.33
    }]);

    if (error) {
        console.log(`[Valor: 3333.33] Erro: ${error.message}`);
    } else {
        console.log(`[Valor: 3333.33] SUCESSO`);
    }

    // Testamos inserir 3333.33 na coluna numero_nf
    const { error: e2 } = await supabase.from('Nota fiscal').insert([{
        fluxo: 'enviado',
        data_emissao: '2024-02-27',
        numero_nf: 3333.33
    }]);

    if (e2) {
        console.log(`[NF: 3333.33] Erro: ${e2.message}`);
    } else {
        console.log(`[NF: 3333.33] SUCESSO`);
    }
}

checkDecimals();
