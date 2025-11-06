import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createPixTransaction } from './agilizeClient.js';

const app = express();

// Armazenamento temporário em memória para a forma de entrega escolhida
// Em produção, considere usar banco de dados ou Redis
const entregaStorage = new Map();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Create PIX transaction (proxy)
app.post('/pix', async (req, res) => {
  try {
    const { code, amount, email, document, url } = req.body || {};
    if (!code || amount == null || !email || !document || !url) {
      return res.status(400).json({ message: 'Missing required fields: code, amount, email, document, url' });
    }

    const payload = { code, amount, email, document, url };
    const response = await createPixTransaction(payload);
    return res.status(201).json(response);
  } catch (err) {
    const status = err.response?.status || 500;
    const data = err.response?.data || { message: err.message };
    // Log detailed provider error to help debugging
    // eslint-disable-next-line no-console
    console.error('Provider error:', {
      status,
      data,
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

// Webhook receiver for Agilize
app.post('/webhook/agilize', async (req, res) => {
  // You can add verification/signature validation here if provided by the provider
  const event = req.body;
  // For now, just log and return 200 so provider considers it delivered
  console.log('Agilize Webhook Received:', JSON.stringify(event));
  return res.status(200).json({ received: true });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running on http://localhost:${port}`);
});


