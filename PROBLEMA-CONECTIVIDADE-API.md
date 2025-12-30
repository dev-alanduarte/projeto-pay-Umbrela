# 🔴 Problema de Conectividade com API UmbrellaPag

## ❌ Diagnóstico Completo

### Status da VPS:
- ✅ DNS funciona (resolve `api-gateway.umbrellapag.com`)
- ✅ HTTPS geral funciona (Google, GitHub)
- ✅ Firewall permite porta 443
- ✅ Servidor rodando corretamente em `0.0.0.0:3001`
- ❌ **Timeout ao conectar com IPs da API UmbrellaPag:**
  - `52.201.206.133:443` → Timeout
  - `3.214.77.131:443` → Provavelmente timeout também

### IP da VPS:
- IPv6: `2804:6dec::c4` (ou similar)
- IPv4: Execute `curl -4 ifconfig.me` para ver IPv4

---

## 🔍 Causa Provável

**IP da VPS bloqueado pela API UmbrellaPag ou pelo provedor de rede.**

Isso pode acontecer se:
1. Muitas requisições falhadas anteriormente
2. IP em lista negra da API
3. Firewall do provedor da VPS bloqueando conexões para essa API
4. Problema de roteamento de rede

---

## ✅ Solução: Contatar Suporte UmbrellaPag

### Informações para o Suporte:

**Assunto:** IP da VPS bloqueado - Timeout ao conectar com API

**Detalhes:**
```
IP da VPS (IPv4): [execute: curl -4 ifconfig.me]
IP da VPS (IPv6): 2804:6dec::c4 (ou similar)

Problema:
- Timeout ao conectar com api-gateway.umbrellapag.com
- DNS resolve corretamente: 52.201.206.133, 3.214.77.131
- HTTPS geral funciona (Google, GitHub)
- Firewall local permite porta 443
- Conexão direta com IP da API também dá timeout

Teste realizado:
curl -v https://52.201.206.133 --max-time 10 -H "Host: api-gateway.umbrellapag.com"
Resultado: Connection timed out after 10000 milliseconds

Solicitação:
Por favor, verificar se o IP da VPS está bloqueado e liberar se necessário.
```

---

## 🔄 Alternativas Temporárias

### 1. Usar Proxy/Tunnel

Se tiver acesso a outro servidor que funcione, pode usar como proxy.

### 2. Verificar com Provedor da VPS

Contatar provedor da VPS para verificar se há bloqueios de rede.

### 3. Aguardar e Tentar Novamente

Pode ser problema temporário de rede. Aguardar algumas horas e tentar novamente.

---

## 📝 Comandos Úteis

```bash
# Ver IPv4 da VPS
curl -4 ifconfig.me

# Testar conectividade novamente
cd ~/projeto-pay-Umbrela/backend
npm run test:vps-network

# Ver logs do backend
pm2 logs projeto-pay-umbrela-backend --lines 30
```

---

**Próximo passo: Contatar suporte UmbrellaPag com as informações acima.**

