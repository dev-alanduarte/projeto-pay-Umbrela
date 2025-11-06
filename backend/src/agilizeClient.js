import axios from 'axios';

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
    timeout: 15000,
  });

  return instance;
}

export async function createPixTransaction(payload) {
  const http = getAgilizeAxios();
  const { data } = await http.post('/pix', payload);
  return data;
}


