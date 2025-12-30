# 🔧 Resolver Timeout com API UmbrellaPag

## ✅ Status Atual

- ✅ Servidor rodando corretamente em `0.0.0.0:3001`
- ✅ Porta acessível
- ❌ Timeout ao conectar com API UmbrellaPag

**Isso significa que o problema é de conectividade com a API, não do servidor.**

---

## 🔍 Diagnóstico

```bash
# 1. Testar conectividade com API
cd ~/projeto-pay-Umbrela/backend
npm run test:vps-network
```

**Se o teste passar:**
- Problema pode ser temporário
- Pode ser rate limiting
- Pode ser muitas requisições simultâneas

**Se o teste falhar:**
- Problema de rede/firewall
- IP pode estar bloqueado
- Problema temporário da API

---

## ✅ Soluções

### 1. Se Teste de Conectividade Passar

```bash
# Reiniciar backend
pm2 restart projeto-pay-umbrela-backend --update-env

# Aguardar alguns minutos e tentar novamente
# Pode ser rate limiting temporário
```

### 2. Se Teste de Conectividade Falhar

```bash
# Verificar DNS
nslookup api-gateway.umbrellapag.com

# Testar conectividade HTTPS geral
curl -I https://www.google.com --max-time 5

# Se Google funciona mas API não, pode ser bloqueio de IP
# Contatar suporte UmbrellaPag
```

### 3. Verificar Logs Detalhados

```bash
# Ver logs em tempo real
pm2 logs projeto-pay-umbrela-backend --lines 0

# Fazer requisição e ver o que acontece
```

---

**Execute `npm run test:vps-network` e me diga o resultado!**

