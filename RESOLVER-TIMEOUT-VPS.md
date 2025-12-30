# 🔧 Resolver Timeout na VPS - Diagnóstico Completo

## ❌ Problema Identificado

A requisição está travando na conexão TCP com a API UmbrellaPag:
- ✅ DNS resolve corretamente
- ✅ Payload está correto
- ✅ API Key está carregada
- ❌ **Conexão TCP na porta 443 não é estabelecida**

## 🔍 Diagnóstico Passo a Passo

### 1. Testar Conectividade Básica

```bash
cd ~/projeto-pay-Umbrela/backend
npm run test:vps-network
```

**Se o teste 4 (requisição real) passar:**
- ✅ Conectividade OK, problema pode ser no código

**Se der timeout:**
- ❌ Problema de rede/firewall da VPS

### 2. Testar Conectividade HTTPS Manual

```bash
# Testar se consegue conectar na porta 443
curl -v https://api-gateway.umbrellapag.com --max-time 10

# Testar com IP direto
curl -v https://52.201.206.133 --max-time 10 -H "Host: api-gateway.umbrellapag.com"
```

**Se der timeout:**
- Firewall bloqueando saída HTTPS
- IP da VPS bloqueado pela API
- Problema de roteamento

### 3. Verificar Firewall Local

```bash
# Ver regras de saída
iptables -L OUTPUT -n -v

# Verificar se porta 443 está liberada
iptables -L OUTPUT -n -v | grep 443
```

### 4. Verificar IP Público da VPS

```bash
curl ifconfig.me
```

**Anote o IP e verifique:**
- Se o IP está bloqueado pela API UmbrellaPag
- Se há restrições de acesso

## 💡 Soluções Possíveis

### Solução 1: Contatar Provedor da VPS

Se outros sites HTTPS também não funcionarem:
- Verificar Security Groups / Firewall Rules
- Solicitar liberação de saída HTTPS (porta 443)

### Solução 2: Contatar Suporte UmbrellaPag

Se outros sites HTTPS funcionarem:
- Enviar IP da VPS: `curl ifconfig.me`
- Solicitar whitelist do IP
- Verificar se há restrições de acesso

### Solução 3: Usar Proxy/Túnel (Temporário)

```bash
# Instalar ngrok ou cloudflared
# Configurar proxy HTTP/HTTPS
```

### Solução 4: Verificar Configuração de Rede da VPS

```bash
# Ver rotas
ip route show

# Ver interfaces de rede
ip addr show

# Testar conectividade com outros serviços
curl -I https://www.google.com --max-time 5
curl -I https://github.com --max-time 5
```

## 🚀 Próximos Passos

1. Execute `npm run test:vps-network` e me mostre o resultado
2. Execute `curl -v https://api-gateway.umbrellapag.com --max-time 10` e me mostre o resultado
3. Execute `curl ifconfig.me` e me mostre o IP da VPS

Com essas informações, posso identificar exatamente onde está o problema.

