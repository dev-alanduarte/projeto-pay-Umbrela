import axios from 'axios';
import httpAgent from 'http';
import httpsAgent from 'https';

const BASE_URL = process.env.UMBRELLAPAG_BASE_URL || 'https://api-gateway.umbrellapag.com';
const API_KEY = process.env.UMBRELLAPAG_API_KEY || 'a70c9b5e-d501-4e8b-8c56-664ac1e91133';

export function getUmbrellaPagAxios() {
  if (!API_KEY) {
    throw new Error('Missing UMBRELLAPAG_API_KEY environment variable');
  }

  const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'User-Agent': 'UMBRELLAB2B/1.0',
    },
    timeout: 30000,
    // Força IPv4 e mantém conexões abertas
    httpAgent: new httpAgent.Agent({ keepAlive: true, family: 4 }),
    httpsAgent: new httpsAgent.Agent({ keepAlive: true, family: 4 }),
  });

  return instance;
}

/**
 * Cria um produto na UmbrellaPag
 * @param {Object} productData - Dados do produto
 * @returns {Promise<string>} uniqueProductLinkId do produto criado
 */
async function createProduct(productData) {
  // Formato multipart/form-data para criação de produto
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  
  form.append('title', productData.title || `Pedido ${productData.code}`);
  form.append('description', productData.description || `Produto para pedido ${productData.code}`);
  form.append('shippingType', productData.shippingType || 'DIGITAL');
  form.append('status', 'ACTIVE');
  form.append('unitPrice', productData.amount.toString());
  form.append('maxInstallments', '1');
  form.append('accessLink', productData.accessLink || '');
  form.append('additionalInfo', productData.additionalInfo || '');
  
  // Métodos de pagamento
  const paymentMethod = {
    creditCard: false,
    pix: true,
    boleto: false,
  };
  form.append('paymentMethod', JSON.stringify(paymentMethod));

  console.log('📦 Criando produto na UmbrellaPag:', {
    title: productData.title,
    unitPrice: productData.amount,
  });

  // Cria instância axios sem Content-Type para permitir que form-data defina
  const http = axios.create({
    baseURL: BASE_URL,
    headers: {
      'accept': 'application/json',
      'x-api-key': API_KEY,
      'User-Agent': 'UMBRELLAB2B/1.0',
      ...form.getHeaders(),
    },
    timeout: 30000,
    httpAgent: new httpAgent.Agent({ keepAlive: true, family: 4 }),
    httpsAgent: new httpsAgent.Agent({ keepAlive: true, family: 4 }),
  });

  const { data } = await http.post('/api/user/products', form);

  if (!(data && data.data && data.data.uniqueProductLinkId)) {
    throw new Error('Produto criado mas uniqueProductLinkId não retornado');
  }

  console.log('✅ Produto criado:', data.data.uniqueProductLinkId);
  return data.data.uniqueProductLinkId;
}

/**
 * Cria um pedido de checkout na UmbrellaPag
 * @param {string} uniqueProductLinkId - ID do produto
 * @param {string} hostname - Hostname do domínio (opcional)
 * @returns {Promise<string>} ID do pedido criado
 */
async function createOrder(uniqueProductLinkId, hostname = null) {
  const http = getUmbrellaPagAxios();

  // Constrói a URL com hostname se fornecido
  let url = `/api/public/checkout/create-order/${uniqueProductLinkId}`;
  if (hostname) {
    url += `?hostname=${encodeURIComponent(hostname)}`;
  }

  console.log('🛒 Criando pedido de checkout:', {
    uniqueProductLinkId,
    hostname: hostname || 'não fornecido',
    url,
  });

  const { data } = await http.post(url);

  if (!(data && data.data && data.data.id)) {
    throw new Error('Pedido criado mas ID não retornado');
  }

  console.log('✅ Pedido criado:', data.data.id);
  return data.data.id;
}

/**
 * Cria o pagamento PIX na UmbrellaPag
 * @param {string} orderId - ID do pedido
 * @param {Object} customerData - Dados do cliente
 * @param {string} hostname - Hostname do domínio (opcional)
 * @returns {Promise<Object>} Dados do pagamento PIX
 */
async function createPayment(orderId, customerData, hostname = null) {
  const http = getUmbrellaPagAxios();

  // Valida e formata o documento
  const documentClean = customerData.document.replace(/\D/g, '');
  if (documentClean.length !== 11 && documentClean.length !== 14) {
    throw new Error(`Documento inválido: deve ter 11 (CPF) ou 14 (CNPJ) dígitos, recebido ${documentClean.length}`);
  }

  // Valida e formata o telefone (deve ter DDD + número)
  let phone = customerData.phone || '';
  phone = phone.replace(/\D/g, '');
  if (phone.length < 10 || phone.length > 11) {
    // Se inválido, usa um padrão válido
    phone = '11987654321';
  }

  // Valida e formata o CEP
  let zipCode = customerData.zipCode || '';
  zipCode = zipCode.replace(/\D/g, '');
  if (zipCode.length !== 8) {
    // CEP padrão válido (São Paulo - Centro)
    zipCode = '01001000';
  }

  // Gera um nome mais realista baseado no email ou usa o fornecido
  let fullName = customerData.fullName;
  if (!fullName || fullName === 'Cliente' || fullName === 'CLIENTE') {
    // Tenta extrair nome do email ou usa um nome padrão mais realista
    const emailName = customerData.email.split('@')[0];
    fullName = emailName.charAt(0).toUpperCase() + emailName.slice(1) + ' Silva';
  }

  // Determina o tipo de documento (CPF ou CNPJ)
  const documentType = documentClean.length === 11 ? 'CPF' : 'CNPJ';
  
  const paymentPayload = {
    fullName: fullName,
    document: documentClean,
    email: customerData.email,
    phone: phone,
    zipCode: zipCode,
    street: customerData.street || 'Rua das Flores',
    streetNumber: customerData.streetNumber || '123',
    neighborhood: customerData.neighborhood || 'Centro',
    complement: customerData.complement || '',
    city: customerData.city || 'São Paulo',
    state: customerData.state || 'SP',
    country: 'BR',
    paymentMethod: 'pix',
    installments: 1,
    // NOTA: O endpoint de checkout público não aceita 'pix' nem 'postbackUrl'
    // Esses campos são apenas para o endpoint /api/user/transactions
  };

  console.log('💳 Payload do pagamento:', {
    fullName: paymentPayload.fullName,
    document: paymentPayload.document,
    email: paymentPayload.email,
    phone: paymentPayload.phone,
    zipCode: paymentPayload.zipCode,
  });
  
  // Log completo do payload para debug
  console.log('💳 Payload COMPLETO sendo enviado:', JSON.stringify(paymentPayload, null, 2));
  console.log('💳 Campos do payload:', Object.keys(paymentPayload));

  // Constrói a URL com hostname se fornecido
  let url = `/api/public/checkout/payment/${orderId}`;
  if (hostname) {
    url += `?hostname=${encodeURIComponent(hostname)}`;
  }

  console.log('💳 Criando pagamento PIX:', {
    orderId,
    hostname: hostname || 'não fornecido',
    paymentMethod: 'pix',
    url,
  });

  try {
    const { data } = await http.post(url, paymentPayload);
    
    console.log('✅ Pagamento criado - Resposta completa:', JSON.stringify(data, null, 2));
    console.log('✅ Pagamento criado - Resumo:', {
      id: (data.data && data.data.id),
      status: (data.data && data.data.order && data.data.order.payment && data.data.order.payment.status),
      hasPix: !!(data.data && data.data.order && data.data.order.payment && data.data.order.payment.pix),
      hasQrCode: !!(data.data && data.data.order && data.data.order.payment && data.data.order.payment.qrCode),
      qrCodeLength: (data.data && data.data.order && data.data.order.payment && data.data.order.payment.qrCode && data.data.order.payment.qrCode.length) || 0,
      pixKeys: (data.data && data.data.order && data.data.order.payment && data.data.order.payment.pix) ? Object.keys(data.data.order.payment.pix) : [],
    });
    
    // Log da resposta completa para debug se recusado
    if ((data && data.data && data.data.order && data.data.order.payment && data.data.order.payment.status) === 'REFUSED') {
      console.error('❌ Pagamento RECUSADO - Detalhes:', {
        status: data.data.order.payment.status,
        refusedReason: data.data.order.payment.refusedReason,
        externalRef: data.data.order.payment.externalRef,
        gatewayId: data.data.order.payment.gatewayId,
        provider: data.data.order.payment.provider,
        payloadEnviado: JSON.stringify(paymentPayload, null, 2),
        payloadInterno: JSON.stringify((data.data.order.payment.payload && data.data.order.payment.payload.data) || {}, null, 2),
      });
      console.error('❌ Resposta COMPLETA da API:', JSON.stringify(data, null, 2));
    }
    
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar pagamento:', {
      message: error.message,
      response: (error.response && error.response.data),
      status: (error.response && error.response.status),
      payloadEnviado: paymentPayload,
    });
    throw error;
  }
}

/**
 * Cria uma transação PIX diretamente usando /api/user/transactions
 * Este é o método recomendado pela documentação para gerar QR Code PIX
 * @param {Object} payload - Dados da transação
 * @param {string} payload.code - Código único da transação
 * @param {number} payload.amount - Valor em reais
 * @param {string} payload.email - Email do cliente
 * @param {string} payload.document - CPF/CNPJ do cliente
 * @param {string} payload.url - URL do webhook para notificações
 * @returns {Promise<Object>} Resposta da API com dados do PIX
 */
async function createPixTransactionDirect(payload) {
  const http = getUmbrellaPagAxios();
  
  // Valida e formata o documento
  const documentClean = payload.document.replace(/\D/g, '');
  if (documentClean.length !== 11 && documentClean.length !== 14) {
    throw new Error(`Documento inválido: deve ter 11 (CPF) ou 14 (CNPJ) dígitos, recebido ${documentClean.length}`);
  }
  
  const documentType = documentClean.length === 11 ? 'CPF' : 'CNPJ';
  
  // Valida e formata o telefone
  let phone = payload.phone || '11987654321';
  phone = phone.replace(/\D/g, '');
  if (phone.length < 10 || phone.length > 11) {
    phone = '11987654321';
  }
  
  // Converte amount para centavos (a API espera em centavos)
  const amountInCents = Math.round(payload.amount * 100);
  
  // Prepara o nome do cliente
  let fullName = payload.fullName || 'Cliente';
  if (fullName === 'Cliente' || fullName === 'CLIENTE') {
    const emailName = payload.email.split('@')[0];
    fullName = emailName.charAt(0).toUpperCase() + emailName.slice(1) + ' Silva';
  }
  
  // Prepara o endereço (pode ser null conforme exemplo de sucesso)
  const address = payload.zipCode ? {
    street: payload.street || 'Rua das Flores',
    streetNumber: payload.streetNumber || '123',
    complement: payload.complement || '',
    zipCode: payload.zipCode.replace(/\D/g, ''),
    neighborhood: payload.neighborhood || 'Centro',
    city: payload.city || 'São Paulo',
    state: payload.state || 'SP',
    country: 'BR',
  } : null;
  
  const transactionPayload = {
    amount: amountInCents, // Em centavos
    currency: 'BRL',
    paymentMethod: 'PIX',
    installments: 1,
    postbackUrl: payload.url || null,
    metadata: JSON.stringify({ code: payload.code }),
    traceable: false,
    ip: '191.246.238.29', // IP do servidor (pode ser obtido dinamicamente)
    customer: {
      name: fullName,
      email: payload.email,
      phone: phone,
      document: {
        type: documentType,
        number: documentClean,
      },
      externalRef: payload.code,
      ...(address && { address }),
    },
    items: [
      {
        title: `Pedido ${payload.code}`,
        unitPrice: amountInCents,
        quantity: 1,
        tangible: false,
        externalRef: payload.code,
      },
    ],
    pix: {
      expiresInDays: 2,
    },
  };
  
  console.log('💳 Criando transação PIX diretamente via /api/user/transactions:', {
    amount: amountInCents,
    currency: 'BRL',
    paymentMethod: 'PIX',
    customer: fullName,
    email: payload.email,
  });
  
  console.log('💳 Payload completo da transação:', JSON.stringify(transactionPayload, null, 2));
  
  try {
    const { data } = await http.post('/api/user/transactions', transactionPayload);
    
    console.log('✅ Transação PIX criada - Resposta completa:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar transação PIX:', {
      message: error.message,
      response: (error.response && error.response.data),
      status: (error.response && error.response.status),
      payloadEnviado: transactionPayload,
    });
    throw error;
  }
}

/**
 * Cria uma transação PIX via UmbrellaPag (fluxo completo)
 * Tenta primeiro usar /api/user/transactions (método direto recomendado)
 * Se falhar, usa o fluxo de checkout público como fallback
 * @param {Object} payload - Dados da transação
 * @param {string} payload.code - Código único da transação
 * @param {number} payload.amount - Valor em reais
 * @param {string} payload.email - Email do cliente
 * @param {string} payload.document - CPF/CNPJ do cliente
 * @param {string} payload.url - URL do webhook para notificações
 * @returns {Promise<Object>} Resposta da API com dados do PIX
 */
export async function createPixTransaction(payload) {
  try {
    console.log('📋 Payload recebido em createPixTransaction:', {
      code: payload.code,
      amount: payload.amount,
      hostname: payload.hostname || 'NÃO FORNECIDO',
    });

    // Tenta primeiro usar o método direto (/api/user/transactions)
    // Este é o método recomendado pela documentação para gerar QR Code
    try {
      console.log('🔄 Tentando criar transação PIX via /api/user/transactions (método direto)...');
      const directResponse = await createPixTransactionDirect(payload);
      
      // Extrai dados do PIX da resposta direta
      const pixData = (directResponse.data && directResponse.data.pix) || {};
      const paymentData = directResponse.data || {};
      
      console.log('✅ Transação criada via método direto:', {
        id: paymentData.id,
        status: paymentData.status,
        hasPix: !!pixData,
        hasQrCode: !!paymentData.qrCode,
      });
      
      // O QR code pode estar em paymentData.qrCode ou em pixData.qrcode
      const qrCodeValue = paymentData.qrCode || pixData.qrcode || pixData.qrCode || '';
      
      const mappedResponse = {
        location: paymentData.id ? `/checkout/payment/${paymentData.id}` : null,
        correlationId: paymentData.id || paymentData.transactionId,
        txid: paymentData.externalRef || paymentData.id,
        status: paymentData.status === 'WAITING_PAYMENT' ? 'ACTIVE' : (paymentData.status || 'ACTIVE'),
        chave: pixData.chave || pixData.key || pixData.pixKey || '',
        pixCopiaECola: qrCodeValue,
        qrCode: qrCodeValue,
        ...(pixData.expirationDate && { expirationDate: pixData.expirationDate }),
      };
      
      console.log('🔄 Resposta mapeada (método direto):', mappedResponse);
      return mappedResponse;
      
    } catch (directError) {
      console.warn('⚠️ Método direto falhou, tentando fluxo de checkout público...', {
        error: directError.message,
        response: (directError.response && directError.response.data),
      });
      
      // Fallback: usa o fluxo de checkout público
      // Etapa 1: Criar produto
      const uniqueProductLinkId = await createProduct({
        code: payload.code,
        amount: payload.amount,
        title: `Pedido ${payload.code}`,
        description: `Pagamento via PIX - R$ ${payload.amount.toFixed(2)}`,
      });

      // Etapa 2: Criar pedido (com hostname se fornecido)
      const hostnameToUse = payload.hostname || process.env.UMBRELLAPAG_HOSTNAME || null;
      console.log('🌐 Usando hostname para criar pedido:', hostnameToUse || 'NÃO FORNECIDO');
      const orderId = await createOrder(uniqueProductLinkId, hostnameToUse);

      // Etapa 3: Criar pagamento PIX (com hostname se fornecido)
      const paymentResponse = await createPayment(orderId, {
        email: payload.email,
        document: payload.document,
        fullName: payload.fullName || 'Cliente',
      }, payload.hostname);

      // Extrai dados do PIX da resposta
      // A estrutura da resposta é: data.order.payment.pix e data.order.payment.qrCode
      const pixData = (paymentResponse.data && paymentResponse.data.order && paymentResponse.data.order.payment && paymentResponse.data.order.payment.pix) || {};
      const paymentData = (paymentResponse.data && paymentResponse.data.order && paymentResponse.data.order.payment) || {};
      const orderData = (paymentResponse.data && paymentResponse.data.order) || {};
      
      console.log('📊 Estrutura da resposta completa:', JSON.stringify({
        paymentStatus: paymentData.status,
        hasPix: !!pixData,
        hasPayment: !!paymentData,
        hasOrder: !!orderData,
        qrCode: paymentData.qrCode ? `SIM (${paymentData.qrCode.length} chars)` : 'NÃO',
        refusedReason: paymentData.refusedReason,
        pixKeys: pixData ? Object.keys(pixData) : [],
        paymentKeys: paymentData ? Object.keys(paymentData).slice(0, 10) : [],
      }, null, 2));
      
      // O QR code pode estar em paymentData.qrCode ou em pixData.qrcode (com 'qrcode' minúsculo)
      const qrCodeValue = paymentData.qrCode || pixData.qrcode || pixData.qrCode || pixData.copiaECola || pixData.pixCopyPaste || '';
      
      // Verifica o status do pagamento
      if (paymentData.status === 'WAITING_PAYMENT') {
        console.log('✅ Pagamento criado com SUCESSO - Aguardando pagamento:', {
          status: paymentData.status,
          hasQrCode: !!qrCodeValue,
          qrCodeLength: qrCodeValue.length,
          pixId: pixData.id,
          expirationDate: pixData.expirationDate,
        });
      } else if (paymentData.status === 'REFUSED') {
        console.warn('⚠️ Pagamento foi RECUSADO pela API:', {
          status: paymentData.status,
          refusedReason: paymentData.refusedReason,
          qrCode: qrCodeValue ? 'Presente' : 'Ausente',
        });
      }
      
      // Mapeia a resposta da UmbrellaPag para o formato esperado pelo frontend
      const txidValue = pixData.endToEndId || 
                       (paymentData.externalRef && paymentData.externalRef !== 'undefined' ? paymentData.externalRef : null) || 
                       paymentData.id || 
                       orderId;
      
      // Determina o status final
      let finalStatus = 'ACTIVE';
      if (paymentData.status === 'WAITING_PAYMENT') {
        finalStatus = 'ACTIVE';
      } else if (paymentData.status === 'REFUSED') {
        finalStatus = 'REFUSED';
      } else if (paymentData.status) {
        finalStatus = paymentData.status;
      }
      
      const mappedResponse = {
        location: paymentData.id ? `/checkout/payment/${paymentData.id}` : null,
        correlationId: paymentData.id || orderData.id || orderId,
        txid: txidValue,
        status: finalStatus,
        chave: pixData.chave || pixData.key || pixData.pixKey || '',
        pixCopiaECola: qrCodeValue,
        qrCode: qrCodeValue,
        // Adiciona informações adicionais se disponíveis
        ...(pixData.expirationDate && { expirationDate: pixData.expirationDate }),
        // Adiciona informações de debug se o pagamento foi recusado
        ...(paymentData.status === 'REFUSED' && {
          refusedReason: paymentData.refusedReason,
          debug: 'Pagamento recusado - verifique os logs para mais detalhes',
        }),
      };

      console.log('🔄 Resposta mapeada (fallback checkout):', mappedResponse);
      return mappedResponse;
    }
  } catch (error) {
    console.error('❌ Erro na chamada UmbrellaPag:', {
      message: error.message,
      response: (error.response && error.response.data),
      status: (error.response && error.response.status),
      headers: (error.response && error.response.headers),
    });
    throw error;
  }
}
