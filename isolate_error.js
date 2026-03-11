
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://btsyvpoelshucpsaaolz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0c3l2cG9lbHNodWNwc2Fhb2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTQ0MzQsImV4cCI6MjA4NzUzMDQzNH0.1o-wfmqK3uhAyhEX4qxHlThc7_fXXcvohu5myLg6xPw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumnTypes() {
    console.log('--- Verificando Tipos de Coluna ---');

    const testRow = {
        data_emissao: '2024-02-27',
        numero_nf: "333333",
        nome_fornecedor: "Teste",
        cnpj: "333333",
        valor: "333333",
        centro_custo: "Operacional",
        obra: "Teste",
        pasta: "https://teste.com",
        fluxo: "enviado"
    };

    const columns = Object.keys(testRow);

    for (const col of columns) {
        const payload = { [col]: testRow[col] };
        if (col !== 'fluxo') payload.fluxo = 'enviado';
        if (col !== 'data_emissao') payload.data_emissao = '2024-02-27';
        if (col !== 'numero_nf') payload.numero_nf = "123";

        const { error } = await supabase.from('Nota fiscal').insert([payload]);

        if (error) {
            console.log(`[Col: ${col}] Erro: ${error.message}`);
        } else {
            console.log(`[Col: ${col}] SUCESSO`);
            // Limpa para nao encher a tabela
            await supabase.from('Nota fiscal').delete().eq('fluxo', 'enviado').eq(col, testRow[col]);
        }
    }

    console.log('\n--- Testando Payload Completo ---');
    const { error: fullError } = await supabase.from('Nota fiscal').insert([testRow]);
    if (fullError) {
        console.log('ERRO PAYLOAD COMPLETO:', fullError.message);
    } else {
        console.log('SUCESSO PAYLOAD COMPLETO');
    }
}

checkColumnTypes();
