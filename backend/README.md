Agilize Backend

Simple Express proxy to Agilize API with PIX creation and webhook receiver.

Setup
1) Install dependencies
```bash
npm install
```

2) Environment variables (required)
Create a `.env` file in `backend/` with:
```bash
CLIENT_ID=mgpx3eggi32IzFBpcGkYtQM0Uxsf
CLIENT_SECRET=mgpx3eggi32IzFBpcGkYtQM0UxsfBsJV
PORT=4000
AGILIZE_BASE_URL=https://api.agilizepay.com
```

3) Run
```bash
npm run dev
```
Server will start on http://localhost:4000

Endpoints
- GET `/health` → health check
- POST `/pix` → creates a PIX transaction (proxies to Agilize)
- POST `/webhook/agilize` → webhook receiver (logs payload)

POST /pix body
```json
{
  "code": "string",
  "amount": 0,
  "email": "string",
  "document": "string",
  "url": "string"
}
```

Response example
```json
{
  "location": "string",
  "correlationId": "string",
  "txid": "string",
  "status": "ACTIVE",
  "chave": "string",
  "pixCopiaECola": "string",
  "qrCode": "string"
}
```

Webhook payload example
```json
{
  "typeTransaction": "PAID_IN",
  "statusTransaction": "sucesso",
  "idTransaction": "string",
  "e2d": "string",
  "paid_by": "string",
  "paid_doc": "string"
}
```

Test with Insomnia
- Method: POST
- URL: http://localhost:4000/pix
- Headers: Content-Type: application/json
- Body: see POST /pix body above

CURL
```bash
curl --request POST \
  --url http://localhost:4000/pix \
  --header 'Content-Type: application/json' \
  --data '{
    "code":"TESTE123",
    "amount": 100,
    "email": "cliente@example.com",
    "document": "12345678900",
    "url": "https://seu-site.com/retorno"
  }'
```


