#!/usr/bin/env node
/**
 * Script para testar se o .env está sendo carregado corretamente
 */

import 'dotenv/config';

console.log('🔍 Testando carregamento de variáveis de ambiente...\n');
console.log('='.repeat(70));

const requiredVars = [
  'UMBRELLAPAG_API_KEY',
  'PORT',
  'NODE_ENV',
  'POSTBACK_URL'
];

let allOk = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mascarar valores sensíveis
    const displayValue = varName.includes('KEY') || varName.includes('SECRET') 
      ? `${value.substring(0, 8)}...` 
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`❌ ${varName}: NÃO DEFINIDA`);
    allOk = false;
  }
});

console.log('\n' + '='.repeat(70));

if (allOk) {
  console.log('✅ Todas as variáveis de ambiente estão carregadas!');
  process.exit(0);
} else {
  console.log('❌ Algumas variáveis de ambiente estão faltando!');
  console.log('\n💡 Verifique se o arquivo .env existe em:');
  console.log('   ' + process.cwd() + '/.env');
  console.log('\n💡 Se estiver usando PM2, verifique se o cwd está correto no ecosystem.config.js');
  process.exit(1);
}

