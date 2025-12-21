import 'dotenv/config';
import dns from 'dns';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { createPixTransaction } from './umbrellapagClient.js';

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
      connectSrc: [
        "'self'", 
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://127.0.0.1:3000", 
        "http://127.0.0.1:3001",
        "https://pagamentoseguromarketplace.com",
        "http://pagamentoseguromarketplace.com"
      ],
    },
  },
}));
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000', 
    'http://localhost:3001', 
    'http://127.0.0.1:3001',
    'https://pagamentoseguromarketplace.com',
    'http://pagamentoseguromarketplace.com'
  ],
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
      position: (function() {
        const match = err.message.match(/position (\d+)/);
        return match ? match[1] : 'desconhecido';
      })(),
    });
  }
  next();
});

app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Create PIX transaction (proxy)
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

// Create PIX transaction via GET (parâmetros na URL)
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

// Rota simples: /:cliente/:produto/payment/:valor
// Exemplo: http://localhost:3001/cliente/produto/payment/20.99
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

// Rota simples alternativa: /:cliente/:produto?payment=valor
// Exemplo: http://localhost:3001/cliente/produto?payment=20.99
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


