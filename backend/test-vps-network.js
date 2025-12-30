#!/usr/bin/env node
/**
 * Script de diagnóstico de conectividade da VPS
 * Testa se a VPS consegue conectar com a API UmbrellaPag
 */

import 'dotenv/config';
import axios from 'axios';
import https from 'https';
import http from 'http';
import dns from 'dns';

const UMBRELLA_API_URL = "https://api-gateway.umbrellapag.com/api/user/transactions";
const UMBRELLA_TOKEN = process.env.UMBRELLAPAG_API_KEY;

async function runDiagnostics() {
  console.log('🔍 DIAGNÓSTICO DE CONECTIVIDADE VPS\n');
  console.log('='.repeat(70));

  // Teste 1: DNS
  console.log('\n1️⃣ Testando resolução DNS...');
  try {
    const addresses = await dns.promises.resolve4('api-gateway.umbrellapag.com');
    console.log(`✅ DNS OK: ${addresses.join(', ')}`);
  } catch (error) {
    console.log(`❌ DNS FALHOU: ${error.message}`);
    process.exit(1);
  }

  // Teste 2: Conectividade HTTPS geral
  console.log('\n2️⃣ Testando conectividade HTTPS geral...');
  try {
    const startTime = Date.now();
    await axios.get('https://www.google.com', {
      timeout: 5000,
      httpsAgent: new https.Agent({ keepAlive: true })
    });
    const elapsed = Date.now() - startTime;
    console.log(`✅ HTTPS geral funciona (${elapsed}ms)`);
  } catch (error) {
    console.log(`❌ HTTPS geral FALHOU: ${error.message}`);
    console.log('   ⚠️  A VPS não consegue fazer conexões HTTPS de saída!');
    process.exit(1);
  }

  // Teste 3: Conectividade com API UmbrellaPag (sem autenticação)
  // PULADO - Vamos direto para teste real com auth
  console.log('\n3️⃣ Testando conectividade com API UmbrellaPag (sem auth)...');
  console.log('   ⏭️  Pulando este teste - indo direto para requisição real com auth');

  // Teste 4: Conectividade com API UmbrellaPag (com autenticação real)
  console.log('\n4️⃣ Testando requisição REAL com API UmbrellaPag (com auth)...');
  if (UMBRELLA_TOKEN) {
    try {
      const testPayload = {
        amount: 100, // R$ 1,00
        currency: "BRL",
        paymentMethod: "PIX",
        installments: 1,
        traceable: false,
        ip: "127.0.0.1",
        postbackUrl: "https://webhook.site/unique-id",
        metadata: JSON.stringify({ source: "test", timestamp: new Date().toISOString() }),
        customer: {
          name: "Teste VPS",
          email: "teste@vps.com",
          phone: "11999999999",
          externalRef: `test_${Date.now()}`,
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
          title: "Teste PIX",
          unitPrice: 100,
          quantity: 1,
          tangible: false,
          externalRef: `test_${Date.now()}`
        }],
        pix: {
          expiresInDays: 1
        }
      };

      const startTime = Date.now();
      const response = await axios.post(UMBRELLA_API_URL, testPayload, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': UMBRELLA_TOKEN,
          'User-Agent': 'UMBRELLAB2B/1.0'
        },
        timeout: 15000,
        validateStatus: function() { return true; },
        httpsAgent: new https.Agent({ keepAlive: true })
      });
      const elapsed = Date.now() - startTime;
      
      console.log(`✅ Requisição real completou (${elapsed}ms)`);
      console.log(`   Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log('   ✅ API respondeu com sucesso!');
      } else {
        console.log(`   ⚠️  API respondeu com status ${response.status}`);
        if (response.data) {
          console.log(`   Resposta: ${JSON.stringify(response.data).substring(0, 200)}...`);
        }
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.log(`❌ TIMEOUT na requisição real`);
        console.log('   ⚠️  A VPS não consegue completar requisições para a API');
      } else {
        console.log(`❌ ERRO: ${error.message}`);
      }
    }
  } else {
    console.log('\n4️⃣ Pulando teste real (UMBRELLAPAG_API_KEY não configurada)');
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ Diagnóstico completo!');
}

// Executar diagnóstico
runDiagnostics().catch(function(error) {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

