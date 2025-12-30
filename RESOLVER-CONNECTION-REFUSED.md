# 🔧 Resolver "Connection Refused" na VPS

## ❌ Problema: `curl: (7) Failed to connect to localhost port 3001`

Isso significa que o servidor **não está rodando** na porta 3001.

---

## ✅ Solução Passo a Passo

### 1. Verificar Status do PM2

```bash
pm2 status
```

**Se não mostrar processos ou mostrar "errored", continue:**

### 2. Limpar PM2 Completamente

```bash
pm2 kill
pm2 delete all
```

### 3. Verificar se a Porta 3001 está Livre

```bash
netstat -tulpn | grep 3001
# ou
lsof -i :3001
```

**Se mostrar algum processo, mate-o:**
```bash
kill -9 <PID>
```

### 4. Verificar Arquivo .env

```bash
cd ~/projeto-pay-Umbrela/backend
cat .env
```

**Deve ter:**
```
UMBRELLAPAG_API_KEY=sua_chave_aqui
PORT=3001
NODE_ENV=production
POSTBACK_URL=https://webhook.site/unique-id
```

### 5. Testar se o Servidor Inicia Manualmente

```bash
cd ~/projeto-pay-Umbrela/backend
node src/server.js
```

**Se der erro, anote o erro e pare com `Ctrl+C`**

### 6. Iniciar com PM2

```bash
cd ~/projeto-pay-Umbrela
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

### 7. Ver Logs para Diagnosticar

```bash
pm2 logs projeto-pay-umbrela-backend --lines 50
```

**Procure por erros como:**
- `Error: Missing UMBRELLAPAG_API_KEY`
- `EADDRINUSE` (porta já em uso)
- `SyntaxError` (erro de código)
- `Cannot find module` (dependência faltando)

### 8. Se PM2 Mostrar "errored", Ver Erros

```bash
pm2 logs projeto-pay-umbrela-backend --err --lines 50
```

---

## 🔍 Diagnóstico Rápido

Execute todos de uma vez:

```bash
# 1. Status PM2
pm2 status

# 2. Ver processos na porta 3001
netstat -tulpn | grep 3001

# 3. Verificar .env
cat ~/projeto-pay-Umbrela/backend/.env | grep UMBRELLAPAG_API_KEY

# 4. Ver logs
pm2 logs projeto-pay-umbrela-backend --lines 20
```

---

## 🚀 Solução Rápida (Se Tudo Estiver OK)

```bash
cd ~/projeto-pay-Umbrela
pm2 kill
pm2 start ecosystem.config.js
pm2 save
sleep 3
pm2 status
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

---

## 📝 Problemas Comuns

### ❌ "Missing UMBRELLAPAG_API_KEY"

**Solução:**
```bash
cd ~/projeto-pay-Umbrela/backend
nano .env
# Adicionar: UMBRELLAPAG_API_KEY=sua_chave
pm2 restart projeto-pay-umbrela-backend --update-env
```

### ❌ "EADDRINUSE" (Porta já em uso)

**Solução:**
```bash
# Encontrar processo usando porta 3001
lsof -i :3001
# Matar processo
kill -9 <PID>
# Reiniciar PM2
pm2 restart projeto-pay-umbrela-backend
```

### ❌ "Cannot find module"

**Solução:**
```bash
cd ~/projeto-pay-Umbrela/backend
npm install --production
pm2 restart projeto-pay-umbrela-backend
```

---

**Execute os comandos de diagnóstico e me envie o resultado!**

