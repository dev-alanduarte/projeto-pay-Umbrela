#!/usr/bin/env node
/**
 * Teste DIRETO na API UmbrellaPag
 * Verifica se a VPS consegue conectar e fazer uma transação real
 */

import 'dotenv/config';
import axios from 'axios';
import https from 'https';

const UMBRELLA_API_URL = "https://api-gateway.umbrellapag.com/api/user/transactions";
const UMBRELLA_TOKEN = process.env.UMBRELLAPAG_API_KEY;

async function testDirect() {
  console.log('🔍 TESTE DIRETO NA API UMBRELLAPAG\n');
  console.log('='.repeat(70));
  
  if (!UMBRELLA_TOKEN) {
    console.error('❌ ERRO: UMBRELLAPAG_API_KEY não está definida no .env');
    console.error('   Verifique se o arquivo .env existe em: backend/.env');
    process.exit(1);
  }
  
  console.log(`✅ API Key encontrada: ${UMBRELLA_TOKEN.substring(0, 8)}...`);
  console.log(`📡 URL: ${UMBRELLA_API_URL}\n`);
  
  // Payload de teste (R$ 1,00)
  const testPayload = {
    amount: 100, // R$ 1,00 em centavos
    currency: "BRL",
    paymentMethod: "PIX",
    installments: 1,
    traceable: false,
    ip: "127.0.0.1",
    postbackUrl: "https://webhook.site/unique-id",
    metadata: JSON.stringify({
      source: "test_direct_vps",
      timestamp: new Date().toISOString()
    }),
    customer: {
      name: "Teste VPS Direto",
      email: "teste@vps.com",
      phone: "11999999999",
      externalRef: `test_direct_${Date.now()}`,
      document: {
        type: "CPF",
        number: "45920621320"
      },
      address: {
        zipCode: "01001000",
        street: "Praça da Sé",
        streetNumber: "1",
        complement: "",
        neighborhood: "Sé",
        city: "São Paulo",
        state: "SP",
        country: "BR"
      }
    },
    items: [{
      title: "Teste PIX Direto",
      unitPrice: 100,
      quantity: 1,
      tangible: false,
      externalRef: `test_direct_${Date.now()}`
    }],
    pix: {
      expiresInDays: 1
    }
  };
  
  console.log('📤 Payload de teste:');
  console.log(JSON.stringify(testPayload, null, 2));
  console.log('\n' + '='.repeat(70));
  console.log('🚀 Enviando requisição...\n');
  
  const startTime = Date.now();
  
  try {
    const response = await axios.post(UMBRELLA_API_URL, testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': UMBRELLA_TOKEN,
        'User-Agent': 'UMBRELLAB2B/1.0'
      },
      timeout: 30000, // 30 segundos
      httpsAgent: new https.Agent({ keepAlive: true }),
      validateStatus: function() { return true; } // Aceita qualquer status
    });
    
    const elapsed = Date.now() - startTime;
    
    console.log(`✅ Requisição completou em ${elapsed}ms`);
    console.log(`📥 Status: ${response.status} ${response.statusText}`);
    console.log('\n📋 Resposta da API:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      console.log('\n' + '='.repeat(70));
      console.log('✅ SUCESSO! API respondeu corretamente!');
      
      // Verificar se tem QR Code
      const data = response.data.data || response.data;
      const pixCode = data.qrCode || 
                     (data.pix && data.pix.qrcode) || 
                     (data.pix && data.pix.qrCode) ||
                     data.pixCode;
      
      if (pixCode) {
        console.log('✅ QR Code PIX gerado com sucesso!');
        console.log(`   Código: ${pixCode.substring(0, 50)}...`);
      } else {
        console.log('⚠️  Resposta OK mas sem QR Code');
      }
      
      console.log('\n🎉 Conectividade da VPS com API UmbrellaPag está FUNCIONANDO!');
      process.exit(0);
    } else {
      console.log('\n' + '='.repeat(70));
      console.log(`⚠️  API respondeu com status ${response.status}`);
      console.log('   Verifique a resposta acima para detalhes');
      process.exit(1);
    }
    
  } catch (error) {
    const elapsed = Date.now() - startTime;
    
    console.log(`\n❌ ERRO após ${elapsed}ms`);
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.log('❌ TIMEOUT - A VPS não conseguiu conectar com a API');
      console.log('   Possíveis causas:');
      console.log('   1. Firewall bloqueando saída HTTPS (porta 443)');
      console.log('   2. IP da VPS bloqueado pela API UmbrellaPag');
      console.log('   3. Problema de rede do provedor da VPS');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ CONEXÃO RECUSADA');
      console.log('   A API recusou a conexão');
    } else if (error.code === 'ENOTFOUND') {
      console.log('❌ DNS não resolveu');
      console.log('   Problema de DNS');
    } else if (error.response) {
      console.log(`❌ Erro HTTP: ${error.response.status}`);
      console.log('   Resposta:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(`❌ ERRO: ${error.message}`);
      console.log(`   Código: ${error.code}`);
      console.log('   Stack:', error.stack);
    }
    
    process.exit(1);
  }
}

// Executar teste
testDirect().catch(function(error) {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

