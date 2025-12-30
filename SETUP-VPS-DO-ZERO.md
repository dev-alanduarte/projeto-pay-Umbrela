# 🚀 Setup Completo na VPS - Do Zero

## ⚠️ IMPORTANTE: Se já tiver algo rodando

```bash
# 1. Parar tudo
pm2 kill

# 2. Remover diretório antigo
cd ~
rm -rf projeto-pay-Umbrela
```

---

## 📥 Passo 1: Clonar Repositório

```bash
cd ~
git clone https://github.com/dev-alanduarte/projeto-pay-Umbrela.git
cd projeto-pay-Umbrela
```

---

## ⚙️ Passo 2: Configurar Backend

```bash
cd backend

# Instalar dependências
npm install --production

# Criar .env
nano .env
```

**Cole isso no .env:**
```
PORT=3001
NODE_ENV=production
UMBRELLAPAG_API_KEY=SUA_CHAVE_AQUI
POSTBACK_URL=https://webhook.site/unique-id
```

**Salvar:** `Ctrl+X`, `Y`, `Enter`

---

## 🧪 Passo 3: Testar Conectividade ANTES de iniciar

```bash
# Teste 1: DNS funciona?
nslookup api-gateway.umbrellapag.com

# Teste 2: HTTPS geral funciona?
curl -I https://www.google.com --max-time 5

# Teste 3: API responde? (deve dar erro 401, mas NÃO timeout)
curl -X POST https://api-gateway.umbrellapag.com/api/user/transactions \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_CHAVE_AQUI" \
  -d '{"test":"test"}' \
  --max-time 10 -v
```

**Se o Teste 3 der TIMEOUT, o problema é de rede/firewall da VPS.**

---

## 🚀 Passo 4: Iniciar Servidor

```bash
# Voltar para raiz
cd ~/projeto-pay-Umbrela

# Criar logs
mkdir -p logs

# Iniciar PM2
pm2 kill  # Limpar primeiro
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

---

## ✅ Passo 5: Testar Endpoint

```bash
# Testar localmente na VPS
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

**Se der timeout, ver logs:**
```bash
pm2 logs projeto-pay-umbrela-backend --lines 30
```

---

## 🔍 Diagnóstico de Timeout

Se estiver dando timeout, execute na VPS:

```bash
# 1. Ver IP da VPS
curl ifconfig.me

# 2. Testar conectividade com outros sites
curl -I https://github.com --max-time 5
curl -I https://www.google.com --max-time 5

# 3. Testar API diretamente
curl -v https://api-gateway.umbrellapag.com --max-time 10

# 4. Verificar firewall
iptables -L OUTPUT -n -v

# 5. Verificar DNS
cat /etc/resolv.conf
```

**Se outros sites HTTPS funcionam mas a API não:**
- IP da VPS pode estar bloqueado pela UmbrellaPag
- Contatar suporte UmbrellaPag para liberar o IP

---

## 📝 Comandos Úteis

```bash
# Ver logs
pm2 logs projeto-pay-umbrela-backend

# Reiniciar
pm2 restart projeto-pay-umbrela-backend

# Atualizar código
cd ~/projeto-pay-Umbrela
git pull origin main
pm2 restart projeto-pay-umbrela-backend --update-env
```

---

## ✅ Checklist

- [ ] Repositório clonado
- [ ] `npm install` executado no backend
- [ ] Arquivo `.env` criado com `UMBRELLAPAG_API_KEY`
- [ ] Teste de conectividade HTTPS funciona
- [ ] PM2 iniciado (`pm2 status` mostra processos online)
- [ ] Teste local funciona (`curl localhost:3001/pix`)

---

**Última atualização:** 2025-12-30

