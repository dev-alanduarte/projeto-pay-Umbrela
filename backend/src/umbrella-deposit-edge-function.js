// Edge Function para gerar QR Code PIX diretamente via UmbrellaPag
// Versão simplificada - apenas gera o QR code para pagamento

const UMBRELLA_API_URL = "https://api-gateway.umbrellapag.com/api/user/transactions";

// Endereço padrão
const DEFAULT_ADDRESS = {
  zipCode: "01001000",
  street: "Praça da Sé",
  streetNumber: "1",
  neighborhood: "Sé",
  city: "São Paulo",
  state: "SP",
  country: "BR"
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("----------------------------------------------------------------");
    console.log("GERANDO QR CODE PIX DIRETAMENTE");
    
    // 1. Verifica token da API
    const UMBRELLA_TOKEN = Deno.env.get('UMBRELLAPAG_API_KEY');
    if (!UMBRELLA_TOKEN) {
      throw new Error("Missing UMBRELLAPAG_API_KEY in environment variables.");
    }

    // 2. Parse Body da requisição
    const reqBody = await req.json();
    console.log("Request Body:", JSON.stringify(reqBody));
    
    // Dados obrigatórios do body
    const { 
      amount,           // Valor em BRL (ex: 50.00)
      name,            // Nome do cliente
      email,           // Email do cliente
      document,        // CPF/CNPJ (apenas números)
      phone            // Telefone (opcional)
    } = reqBody;
    
    // Validações
    if (!amount || amount < 1) {
      throw new Error('Invalid amount (minimum 1.00).');
    }
    if (!name || !email || !document) {
      throw new Error('Missing required fields: name, email, document');
    }

    // 3. Preparar dados
    const amountInCents = Math.round(amount * 100);
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || "127.0.0.1";
    
    // Limpa e valida CPF/CNPJ
    const documentClean = document.replace(/\D/g, '');
    if (documentClean.length !== 11 && documentClean.length !== 14) {
      throw new Error(`Documento inválido: deve ter 11 (CPF) ou 14 (CNPJ) dígitos`);
    }
    const documentType = documentClean.length === 11 ? 'CPF' : 'CNPJ';
    
    // Limpa e valida telefone
    let phoneClean = phone ? phone.replace(/\D/g, '') : '11999999999';
    if (phoneClean.length < 10 || phoneClean.length > 11) {
      phoneClean = '11999999999';
    }

    // 4. Preparar payload para a API UmbrellaPag
    const transactionPayload = {
      amount: amountInCents, // Em centavos
      currency: "BRL",
      paymentMethod: "PIX",
      installments: 1,
      traceable: false, // IMPORTANTE: false para gerar QR code diretamente
      ip: clientIp.split(',')[0].trim(),
      customer: {
        name: name,
        email: email,
        phone: phoneClean,
        document: {
          type: documentType,
          number: documentClean
        },
        address: DEFAULT_ADDRESS
      },
      items: [
        {
          title: "Pagamento PIX",
          unitPrice: amountInCents,
          quantity: 1,
          tangible: false
        }
      ],
      pix: {
        expiresInDays: 1
      }
    };

    // Log do payload
    console.log("Payload para UmbrellaPag:", JSON.stringify(transactionPayload, null, 2));

    // 5. Chamar API UmbrellaPag
    const umbrellaRes = await fetch(UMBRELLA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': UMBRELLA_TOKEN,
        'User-Agent': 'UMBRELLAB2B/1.0'
      },
      body: JSON.stringify(transactionPayload)
    });

    console.log(`Umbrella API Status: ${umbrellaRes.status} ${umbrellaRes.statusText}`);

    // 6. Parse da resposta
    let umbrellaData;
    const responseText = await umbrellaRes.text();
    console.log("Umbrella Response:", responseText);

    try {
      umbrellaData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON response");
      throw new Error(`Umbrella API Error (Non-JSON): ${umbrellaRes.status} ${umbrellaRes.statusText}`);
    }

    if (!umbrellaRes.ok) {
      const errorMsg = umbrellaData?.message || umbrellaData?.error || JSON.stringify(umbrellaData);
      throw new Error(`Umbrella API Declined: ${errorMsg}`);
    }

    // 7. Extrair QR Code da resposta
    const transactionId = umbrellaData.data?.id || umbrellaData.id;
    const pixData = umbrellaData.data?.pix || umbrellaData.pix || {};
    const paymentData = umbrellaData.data || umbrellaData;
    
    // Tenta extrair o QR code de várias possíveis localizações
    const pixCode = paymentData.qrCode || 
                    pixData.qrcode || 
                    pixData.qrCode || 
                    pixData.copiaECola || 
                    pixData.pixCopyPaste ||
                    paymentData.pix?.qrcode ||
                    paymentData.pix?.qrCode;

    console.log("Extracted PIX Data:", {
      transactionId: transactionId,
      hasQrCode: !!pixCode,
      qrCodeLength: pixCode ? pixCode.length : 0
    });

    if (!transactionId) {
      console.error("Missing Transaction ID. Available keys:", Object.keys(umbrellaData));
      throw new Error("Success response received but missing Transaction ID.");
    }

    if (!pixCode) {
      console.error("Missing PIX QR Code. Full response:", JSON.stringify(umbrellaData, null, 2));
      throw new Error("Success response received but missing PIX QR Code.");
    }

    // 8. Retornar QR Code
    return new Response(
      JSON.stringify({
        success: true,
        transactionId: transactionId,
        pixCode: pixCode,
        pix_copy_paste: pixCode,
        amount: amountInCents,
        amountBRL: amount,
        status: 'pending',
        ...(pixData.expirationDate && { expirationDate: pixData.expirationDate }),
        ...(pixData.chave && { pixKey: pixData.chave })
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error("ERROR:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
