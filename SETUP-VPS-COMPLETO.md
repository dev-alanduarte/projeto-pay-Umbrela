# 🚀 Setup Completo do Projeto na VPS - Do Zero

## 📋 Pré-requisitos
- Acesso SSH à VPS
- Git instalado
- Node.js instalado (v12+)
- PM2 instalado globalmente

---

## 🔧 Passo 1: Limpar Ambiente (se já existir)

```bash
# Parar todos os processos PM2
pm2 kill

# Remover diretório antigo (se existir)
cd ~
rm -rf projeto-pay-Umbrela

# Limpar logs antigos
rm -rf ~/projeto-pay-Umbrela/logs
```

---

## 📥 Passo 2: Clonar Repositório

```bash
cd ~
git clone https://github.com/dev-alanduarte/projeto-pay-Umbrela.git
cd projeto-pay-Umbrela
```

---

## ⚙️ Passo 3: Configurar Backend

```bash
cd backend

# Instalar dependências
npm install --production

# Criar arquivo .env
nano .env
```

**Conteúdo do `.env`:**
```env
PORT=3001
NODE_ENV=production
UMBRELLAPAG_API_KEY=sua_chave_aqui
POSTBACK_URL=https://webhook.site/unique-id
```

**Salvar:** `Ctrl+X`, depois `Y`, depois `Enter`

---

## 🧪 Passo 4: Testar Conectividade com API

```bash
# Testar se consegue resolver DNS
nslookup api-gateway.umbrellapag.com

# Testar conectividade HTTPS básica
curl -I https://www.google.com --max-time 5

# Testar conectividade com API (deve dar erro 401/403, mas não timeout)
curl -X POST https://api-gateway.umbrellapag.com/api/user/transactions \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua_chave_aqui" \
  -d '{"test":"test"}' \
  --max-time 10
```

**Se der timeout aqui, o problema é de rede/firewall da VPS.**

---

## 🚀 Passo 5: Iniciar Servidor com PM2

```bash
# Voltar para raiz do projeto
cd ~/projeto-pay-Umbrela

# Criar diretório de logs
mkdir -p logs

# Iniciar com PM2
pm2 start ecosystem.config.js

# Salvar configuração do PM2
pm2 save

# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs
```

---

## ✅ Passo 6: Testar Endpoint Localmente na VPS

```bash
# Testar endpoint /pix
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

## 🔍 Passo 7: Verificar Logs se Der Erro

```bash
# Ver logs do backend
pm2 logs projeto-pay-umbrela-backend --lines 50

# Ver apenas erros
pm2 logs projeto-pay-umbrela-backend --err --lines 50
```

---

## 🐛 Problemas Comuns

### ❌ Timeout ao conectar com API

**Possíveis causas:**
1. Firewall bloqueando porta 443
2. IP da VPS bloqueado pela API
3. Problema de rede do provedor

**Soluções:**
```bash
# Verificar firewall
iptables -L OUTPUT -n -v

# Testar conectividade geral
curl -I https://www.google.com --max-time 5

# Se Google funciona mas API não, pode ser bloqueio de IP
# Contatar suporte UmbrellaPag para liberar IP da VPS
```

### ❌ Erro "Missing UMBRELLAPAG_API_KEY"

**Solução:**
```bash
# Verificar se .env existe e tem a chave
cat backend/.env

# Reiniciar PM2 para carregar novas variáveis
pm2 restart projeto-pay-umbrela-backend --update-env
```

### ❌ Erro de sintaxe (optional chaining)

**Solução:**
```bash
# Verificar versão do Node.js
node -v

# Se for v12 ou menor, atualizar Node.js
# Usar NVM para instalar Node.js v18+
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

---

## 📝 Comandos Úteis

```bash
# Reiniciar backend
pm2 restart projeto-pay-umbrela-backend

# Parar tudo
pm2 stop all

# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs

# Atualizar código do GitHub
cd ~/projeto-pay-Umbrela
git pull origin main
pm2 restart projeto-pay-umbrela-backend
```

---

## ✅ Checklist Final

- [ ] Repositório clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado com `UMBRELLAPAG_API_KEY`
- [ ] Teste de conectividade HTTPS funciona
- [ ] PM2 iniciado e processos online
- [ ] Teste local (`curl localhost:3001/pix`) funciona
- [ ] Logs não mostram erros

---

## 🎯 Próximos Passos

Depois que o backend estiver funcionando localmente na VPS:
1. Configurar Nginx como proxy reverso
2. Configurar SSL/HTTPS
3. Testar frontend

---

**Última atualização:** 2025-12-30

