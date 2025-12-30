import axios from 'axios';
import http from 'http';
import https from 'https';
import dns from 'dns';

const UMBRELLA_API_URL = "https://api-gateway.umbrellapag.com/api/user/transactions";

console.log('🔍 Testando conectividade com API UmbrellaPag...\n');

// Teste 1: DNS
console.log('1️⃣ Testando DNS...');
dns.lookup('api-gateway.umbrellapag.com', (err, address, family) => {
  if (err) {
    console.error('❌ Erro DNS:', err.message);
  } else {
    console.log(`✅ DNS OK: ${address} (IPv${family})`);
  }
});

// Teste 2: Conectividade básica
console.log('\n2️⃣ Testando conectividade HTTPS...');
const testPayload = {
  amount: 1000,
  currency: "BRL",
  paymentMethod: "PIX",
  installments: 1,
  traceable: false,
  ip: "127.0.0.1",
  customer: {
    name: "Teste",
    email: "teste@teste.com",
    phone: "11999999999",
    document: {
      type: "CPF",
      number: "00000000000"
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
    title: "Teste",
    unitPrice: 1000,
    quantity: 1,
    tangible: false
  }],
  pix: {
    expiresInDays: 1
  }
};

const apiKey = process.env.UMBRELLAPAG_API_KEY || 'test-key';

console.log('📡 Tentando conectar...');
const startTime = Date.now();

axios.post(UMBRELLA_API_URL, testPayload, {
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'User-Agent': 'UMBRELLAB2B/1.0'
  },
  timeout: 10000, // 10 segundos para teste
  httpAgent: new http.Agent({ keepAlive: true, family: 4 }),
  httpsAgent: new https.Agent({ keepAlive: true, family: 4 }),
  validateStatus: () => true // Aceita qualquer status
})
.then(response => {
  const elapsed = Date.now() - startTime;
  console.log(`✅ Conectividade OK! Status: ${response.status}, Tempo: ${elapsed}ms`);
  if (response.status === 200) {
    console.log('✅ API respondeu com sucesso!');
  } else {
    console.log(`⚠️ API respondeu com status ${response.status}`);
    console.log('Resposta:', JSON.stringify(response.data).substring(0, 200));
  }
  process.exit(0);
})
.catch(error => {
  const elapsed = Date.now() - startTime;
  console.log(`\n❌ Erro após ${elapsed}ms:`);
  
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    console.log('❌ TIMEOUT - A VPS não consegue conectar à API');
    console.log('\n💡 Possíveis causas:');
    console.log('   1. Firewall bloqueando conexões HTTPS de saída');
    console.log('   2. IP da VPS bloqueado pela API UmbrellaPag');
    console.log('   3. Problema de DNS');
    console.log('   4. Problema de rede do provedor');
  } else if (error.code === 'ENOTFOUND') {
    console.log('❌ DNS ERROR - Não consegue resolver o domínio');
  } else if (error.code === 'ECONNREFUSED') {
    console.log('❌ CONNECTION REFUSED - Porta bloqueada ou servidor não acessível');
  } else if (error.code === 'ETIMEDOUT') {
    console.log('❌ TIMEOUT - Conexão demorou muito');
  } else {
    console.log(`❌ Erro: ${error.code || error.message}`);
  }
  
  if (error.response) {
    console.log(`\n📥 API respondeu: Status ${error.response.status}`);
    console.log('Resposta:', JSON.stringify(error.response.data).substring(0, 200));
  }
  
  process.exit(1);
});

