# 🔧 Resolver Erro do PM2

## ✅ Status: Backend funciona com `npm run dev`

O servidor está funcionando perfeitamente quando roda diretamente:
- ✅ Requisição completa em 1866ms
- ✅ Status 200 OK
- ✅ QR Code gerado com sucesso

## ❌ Problema: PM2 está com processos em erro

Vejo vários processos PM2 com status "errored". Vamos limpar e reiniciar corretamente.

## 🧹 Passo 1: Limpar Todos os Processos PM2

```bash
# Parar todos os processos
pm2 stop all

# Deletar todos os processos
pm2 delete all

# Limpar completamente
pm2 kill

# Verificar se limpou
pm2 status
# Deve mostrar: No process found
```

## 🔍 Passo 2: Verificar Logs de Erro (Se Houver)

```bash
# Ver logs de erro do backend
pm2 logs projeto-pay-umbrela-backend --err --lines 50

# Ver logs de erro do frontend
pm2 logs projeto-pay-umbrela-frontend --err --lines 50
```

## ✅ Passo 3: Verificar ecosystem.config.js

```bash
cd ~/projeto-pay-Umbrela
cat ecosystem.config.js
```

**Deve ter:**
- `script: 'src/server.js'` (não `npm start`)
- `cwd: './backend'` (caminho relativo ou absoluto)
- `interpreter: 'node'`

## 🚀 Passo 4: Iniciar PM2 Corretamente

```bash
cd ~/projeto-pay-Umbrela

# Garantir que está na raiz do projeto
pwd
# Deve mostrar: /root/projeto-pay-Umbrela

# Iniciar PM2
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Verificar status
pm2 status
```

**Deve mostrar:**
```
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ projeto-pay-umbre… │ fork     │ 0    │ online    │ 0%       │ XX.Xmb   │
│ 1  │ projeto-pay-umbre… │ fork     │ 0    │ online    │ 0%       │ XX.Xmb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

## 📋 Passo 5: Verificar Logs

```bash
# Ver logs do backend
pm2 logs projeto-pay-umbrela-backend --lines 20

# Deve mostrar:
# Backend running on http://0.0.0.0:3001
# ✅ Acessível via: http://localhost:3001 ou http://24.152.36.55:3001
```

## 🧪 Passo 6: Testar Endpoint

```bash
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

## ⚠️ Se Ainda Der Erro

Verifique os logs de erro:

```bash
pm2 logs projeto-pay-umbrela-backend --err --lines 50
```

**Erros comuns:**
- `Cannot find module` - Execute `npm install` no diretório backend
- `Missing UMBRELLAPAG_API_KEY` - Verifique se o `.env` existe em `backend/.env`
- `EADDRINUSE` - Porta 3001 já em uso, mate o processo: `lsof -i :3001` e `kill -9 <PID>`

## 🔄 Se Precisar Atualizar Código

```bash
cd ~/projeto-pay-Umbrela
git pull origin main
pm2 restart all
```

