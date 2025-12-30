# 🔄 Reiniciar Frontend no PM2

## ❌ Problema: Frontend ainda com erro ERR_REQUIRE_ESM

O PM2 ainda está usando a configuração antiga. Precisamos limpar e reiniciar.

## 🧹 Passo 1: Limpar e Atualizar

```bash
# 1. Parar todos os processos
pm2 stop all

# 2. Deletar todos os processos
pm2 delete all

# 3. Limpar completamente
pm2 kill

# 4. Atualizar código
cd ~/projeto-pay-Umbrela
git pull origin main

# 5. Verificar se o ecosystem.config.js foi atualizado
cat ecosystem.config.js | grep -A 5 "projeto-pay-umbrela-frontend"
```

**Deve mostrar:**
```javascript
{
  name: 'projeto-pay-umbrela-frontend',
  script: 'npm',
  args: 'start',
  cwd: './frontend',
  interpreter: 'none',
```

## 🚀 Passo 2: Reiniciar PM2

```bash
# Iniciar PM2 com nova configuração
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Verificar status
pm2 status
```

**Deve mostrar ambos "online":**
```
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ projeto-pay-umbre… │ fork     │ 0    │ online    │ 0%       │ XX.Xmb   │
│ 1  │ projeto-pay-umbre… │ fork     │ 0    │ online    │ 0%       │ XX.Xmb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

## 📋 Passo 3: Verificar Logs

```bash
# Ver logs do frontend
pm2 logs projeto-pay-umbrela-frontend --lines 10
```

**Deve mostrar:**
```
Frontend server running on http://0.0.0.0:3000
✅ Acessível via: http://localhost:3000 ou http://24.152.36.55:3000
```

## 🌍 Passo 4: Acessar no Navegador

```
http://24.152.36.55:3000/produto?payment=29.99
```

## ⚠️ Se Ainda Der Erro

Verifique se o `ecosystem.config.js` foi atualizado:

```bash
cd ~/projeto-pay-Umbrela
cat ecosystem.config.js
```

Se ainda mostrar `script: 'server.js'` ao invés de `script: 'npm'`, o git pull não funcionou. Execute:

```bash
git fetch origin
git reset --hard origin/main
pm2 kill
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

