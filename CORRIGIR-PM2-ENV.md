# 🔧 Corrigir PM2 para Carregar .env Corretamente

## ❌ Problema

Quando roda `npm run dev` diretamente funciona, mas via PM2 dá timeout.

**Causa:** PM2 não estava carregando o `.env` corretamente porque usava `npm start` ao invés de rodar o Node diretamente.

## ✅ Solução

O `ecosystem.config.js` foi atualizado para:
- Rodar `node src/server.js` diretamente (ao invés de `npm start`)
- Garantir que o `cwd: './backend'` está correto para o `dotenv/config` encontrar o `.env`

## 🚀 Passos na VPS

```bash
# 1. Atualizar código do GitHub
cd ~/projeto-pay-Umbrela
git pull origin main

# 2. Parar PM2
pm2 kill

# 3. Limpar processos antigos
pm2 delete all

# 4. Verificar se o .env existe e está correto
cd backend
cat .env | grep UMBRELLAPAG_API_KEY
# Deve mostrar: UMBRELLAPAG_API_KEY=sua_chave_aqui

# 5. Voltar para raiz e iniciar PM2
cd ~/projeto-pay-Umbrela
pm2 start ecosystem.config.js

# 6. Salvar configuração
pm2 save

# 7. Verificar status
pm2 status

# 8. Ver logs para confirmar que carregou o .env
pm2 logs projeto-pay-umbrela-backend --lines 20
```

**Deve mostrar:**
```
Backend running on http://0.0.0.0:3001
✅ Acessível via: http://localhost:3001 ou http://24.152.36.55:3001
```

## 🧪 Testar

```bash
# Testar endpoint
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

**Deve retornar:**
```json
{
  "success": true,
  "transactionId": "...",
  "pixCode": "...",
  ...
}
```

## ⚠️ Se Ainda Der Timeout

Verificar se o `.env` está no lugar certo:

```bash
cd ~/projeto-pay-Umbrela/backend
ls -la .env
cat .env
```

**Deve ter:**
```
UMBRELLAPAG_API_KEY=sua_chave_aqui
POSTBACK_URL=https://webhook.site/unique-id
PORT=3001
NODE_ENV=production
```

Se não tiver, criar:

```bash
cd ~/projeto-pay-Umbrela/backend
nano .env
```

Cole o conteúdo acima e salve (`Ctrl+X`, `Y`, `Enter`).

Depois reinicie o PM2:

```bash
cd ~/projeto-pay-Umbrela
pm2 restart all
```

