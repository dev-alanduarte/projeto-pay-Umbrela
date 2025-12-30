#!/usr/bin/env node
/**
 * Teste simples de conectividade GET com API UmbrellaPag
 */

import 'dotenv/config';
import axios from 'axios';
import https from 'https';

const API_URL = "https://api-gateway.umbrellapag.com/api";

async function testGet() {
  console.log('🔍 Testando conexão GET com API UmbrellaPag\n');
  console.log('='.repeat(70));
  console.log(`URL: ${API_URL}\n`);

  try {
    const startTime = Date.now();
    
    const response = await axios.get(API_URL, {
      timeout: 15000,
      httpsAgent: new https.Agent({ keepAlive: true }),
      validateStatus: function() { return true; } // Aceita qualquer status
    });
    
    const elapsed = Date.now() - startTime;
    
    console.log(`✅ Conexão OK! (${elapsed}ms)`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers:`, JSON.stringify(response.headers, null, 2).substring(0, 200));
    
    if (response.data) {
      console.log(`   Body (primeiros 500 chars):`, JSON.stringify(response.data).substring(0, 500));
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Teste completo!');
    
  } catch (error) {
    console.log(`❌ Erro ao conectar`);
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.log('❌ TIMEOUT - Não conseguiu conectar');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ CONEXÃO RECUSADA');
    } else if (error.code === 'ENOTFOUND') {
      console.log('❌ DNS não resolveu');
    } else {
      console.log(`❌ ERRO: ${error.message}`);
      console.log(`   Código: ${error.code}`);
    }
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, JSON.stringify(error.response.data).substring(0, 200));
    }
    
    process.exit(1);
  }
}

testGet().catch(function(error) {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

