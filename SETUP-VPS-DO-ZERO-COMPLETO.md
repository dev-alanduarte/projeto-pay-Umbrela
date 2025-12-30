# 🚀 Setup VPS do Zero - Passo a Passo Completo

## ⚠️ IMPORTANTE: Limpar Tudo Primeiro

```bash
# 1. Parar e limpar PM2
pm2 kill
pm2 delete all

# 2. Verificar processos na porta 3001
lsof -i :3001
# Se houver, matar: kill -9 <PID>

# 3. Remover diretório antigo (se quiser começar do zero)
# cd ~
# rm -rf projeto-pay-Umbrela
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
```env
PORT=3001
NODE_ENV=production
UMBRELLAPAG_API_KEY=SUA_CHAVE_AQUI
POSTBACK_URL=https://webhook.site/unique-id
```

**Salvar:** `Ctrl+X`, `Y`, `Enter`

**Verificar se salvou:**
```bash
cat .env
```

---

## 🧪 Passo 3: Testar Conectividade ANTES de Iniciar

```bash
# Teste de conectividade com API
npm run test:vps-network
```

**Se o teste 4 (requisição real) passar:**
- ✅ Conectividade OK, pode continuar

**Se der timeout:**
- ❌ Problema de rede/firewall
- Ver seção "Resolver Problema de Conectividade" abaixo

---

## 🚀 Passo 4: Iniciar Servidor

```bash
# Voltar para raiz
cd ~/projeto-pay-Umbrela

# Criar logs
mkdir -p logs

# Iniciar PM2
pm2 kill  # Garantir que está limpo
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

**Verificar logs:**
```bash
pm2 logs projeto-pay-umbrela-backend --lines 20
```

**Deve mostrar:**
```
Backend running on http://0.0.0.0:3001
✅ Acessível via: http://localhost:3001 ou http://24.152.36.55:3001
```

---

## ✅ Passo 5: Testar Endpoint

```bash
# Testar localmente na VPS
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

**Resultado esperado:**
```json
{
  "success": true,
  "transactionId": "...",
  "pixCode": "00020101...",
  "amountBRL": 10,
  "status": "pending"
}
```

---

## 🔍 Passo 6: Verificar Porta

```bash
# Verificar se está escutando em 0.0.0.0
ss -tulpn | grep 3001
# ou
lsof -i :3001
```

**Deve mostrar:**
```
tcp   LISTEN 0  ...  0.0.0.0:3001  ...
```

**Se mostrar `127.0.0.1:3001` ao invés de `0.0.0.0:3001`:**
- Servidor não está escutando em todas as interfaces
- Verificar código: `grep -A 2 "app.listen" backend/src/server.js`
- Deve mostrar: `app.listen(port, '0.0.0.0', () => {`

---

## 🐛 Resolver Problema de Conectividade

### Se `npm run test:vps-network` der timeout:

```bash
# 1. Ver IP da VPS
curl -4 ifconfig.me

# 2. Testar conectividade HTTPS geral
curl -I https://www.google.com --max-time 5

# 3. Testar IP direto da API
curl -v https://52.201.206.133 --max-time 10 -H "Host: api-gateway.umbrellapag.com"

# 4. Verificar firewall
iptables -L OUTPUT -n -v | head -20
```

**Se Google funciona mas API não:**
- IP da VPS pode estar bloqueado pela UmbrellaPag
- Contatar suporte UmbrellaPag para liberar IP

---

## 📝 Checklist Completo

- [ ] Repositório clonado
- [ ] `npm install` executado no backend
- [ ] Arquivo `.env` criado com `UMBRELLAPAG_API_KEY`
- [ ] Teste de conectividade passa (`npm run test:vps-network`)
- [ ] PM2 iniciado (`pm2 status` mostra processos online)
- [ ] Logs mostram "Backend running on http://0.0.0.0:3001"
- [ ] Porta 3001 escutando em `0.0.0.0` (não `127.0.0.1`)
- [ ] Teste local funciona (`curl localhost:3001/pix`)
- [ ] Teste via IP público funciona (`curl 24.152.36.55:3001/pix`)

---

## 🔄 Se Ainda Não Funcionar

### Verificar Logs Detalhados:

```bash
# Ver logs em tempo real
pm2 logs projeto-pay-umbrela-backend --lines 0

# Em outro terminal, fazer requisição
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

**Procurar por:**
- Erros de conexão
- Timeouts
- Mensagens de erro da API

---

**Execute os passos na ordem e me diga em qual passo parou ou qual erro apareceu!**

