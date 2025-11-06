import axios from 'axios';
import http from 'http';
import https from 'https';

const BASE_URL = process.env.AGILIZE_BASE_URL || 'https://api.agilizepay.com';

export function getAgilizeAxios() {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing CLIENT_ID or CLIENT_SECRET environment variables');
  }

  const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
      'accept': 'application/json',
      'client_id': clientId,
      'client_secret': clientSecret,
    },
    timeout: 30000,
    // Força IPv4 e mantém conexões abertas
    httpAgent: new http.Agent({ keepAlive: true, family: 4 }),
    httpsAgent: new https.Agent({ keepAlive: true, family: 4 }),
  });

  return instance;
}

export async function createPixTransaction(payload) {
  const http = getAgilizeAxios();
  const { data } = await http.post('/pix', payload);
  return data;
}


