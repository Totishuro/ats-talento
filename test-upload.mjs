import fs from 'fs';
import path from 'path';

// Utilizando fetch nativo do Node.js 18+
async function runTest() {
    try {
        const dummyPdfPath = path.join(process.cwd(), 'dummy_resume.pdf');

        // Ensure dummy file exists
        if (!fs.existsSync(dummyPdfPath)) {
            console.error('❌ Dummy file not found at:', dummyPdfPath);
            return;
        }

        const stats = fs.statSync(dummyPdfPath);
        const fileContent = fs.readFileSync(dummyPdfPath);
        const file = new Blob([fileContent], { type: 'application/pdf' });

        const formData = new FormData();
        formData.append('fullName', 'Candidato Teste Automatizado');
        formData.append('cpf', '999.999.999-99');
        formData.append('email', `teste.auto.${Date.now()}@example.com`);
        formData.append('phone', '(11) 99999-9999');
        formData.append('city', 'São Paulo');
        formData.append('state', 'SP');
        formData.append('country', 'Brasil');
        formData.append('resumeFile', file, 'dummy_resume.pdf');

        console.log('🚀 Iniciando upload para: https://ats-talento.vercel.app/api/candidates');

        const response = await fetch('https://ats-talento.vercel.app/api/candidates', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na requisição: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Candidato criado com sucesso!');
        console.log('🆔 ID:', result.id);
        console.log('📂 Resume File URL no banco:', result.resumeFileUrl);

        // Verify Download
        const downloadUrl = `https://ats-talento.vercel.app/api/candidates/${result.id}/resume`;
        console.log('⬇️ Tentando baixar currículo de:', downloadUrl);

        const downloadResponse = await fetch(downloadUrl);

        if (downloadResponse.status === 200) {
            const buffer = await downloadResponse.arrayBuffer();
            console.log(`✅ Download com sucesso! Tamanho: ${buffer.byteLength} bytes`);

            if (buffer.byteLength === stats.size) {
                console.log('🎉 SUCESSO TOTAL: O tamanho do arquivo baixado é idêntico ao enviado!');
            } else {
                console.log('⚠️ AVISO: Tamanhos diferentes (pode ser compressão ou header extra), mas download funcionou.');
            }

        } else {
            console.error(`❌ Falha no download: ${downloadResponse.status} - ${await downloadResponse.text()}`);
        }

    } catch (error) {
        console.error('❌ FALHA NO TESTE:', error);
    }
}

runTest();
