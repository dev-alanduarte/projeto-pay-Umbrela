# 🌐 Resolver Problema de Conectividade com API UmbrellaPag

## Problema: Connection timed out ao acessar API externa

A VPS não consegue conectar à API UmbrellaPag (`api-gateway.umbrellapag.com`).

### Diagnóstico Passo a Passo

#### 1. Verificar DNS
```bash
nslookup api-gateway.umbrellapag.com
# ou
dig api-gateway.umbrellapag.com
```

#### 2. Testar ping (se permitido)
```bash
ping -c 3 api-gateway.umbrellapag.com
```

#### 3. Verificar firewall (iptables)
```bash
# Ver regras de firewall
iptables -L -n -v

# Ver se está bloqueando saída HTTPS (porta 443)
iptables -L OUTPUT -n -v | grep 443
```

#### 4. Testar outras conexões HTTPS
```bash
# Testar Google
curl -I https://www.google.com --max-time 10

# Testar GitHub
curl -I https://github.com --max-time 10
```

#### 5. Verificar se há proxy necessário
```bash
# Ver variáveis de ambiente de proxy
env | grep -i proxy

# Se houver proxy, configurar no curl
curl -I https://api-gateway.umbrellapag.com --max-time 10 --proxy http://proxy:porta
```

---

## Soluções Possíveis

### Solução 1: Liberar Firewall (iptables)

Se o firewall estiver bloqueando:

```bash
# Permitir saída HTTPS (porta 443)
iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT

# Salvar regras (depende da distribuição)
# Ubuntu/Debian:
iptables-save > /etc/iptables/rules.v4

# CentOS/RHEL:
service iptables save
```

### Solução 2: Verificar se há firewall de rede (Cloud Provider)

Se estiver usando AWS, DigitalOcean, etc., verificar:
- Security Groups
- Network ACLs
- Firewall Rules

### Solução 3: Usar Proxy (se necessário)

Se a VPS estiver atrás de um proxy corporativo:

```bash
# Configurar proxy no sistema
export http_proxy=http://proxy:porta
export https_proxy=http://proxy:porta

# Ou configurar no Node.js via variável de ambiente
export HTTP_PROXY=http://proxy:porta
export HTTPS_PROXY=http://proxy:porta
```

### Solução 4: Verificar se IP está bloqueado

A API pode estar bloqueando o IP da VPS. Testar de outro servidor ou IP.

---

## Teste Alternativo: Usar IP Direto

Se o DNS estiver com problema, tentar usar IP direto:

```bash
# Descobrir IP do domínio
nslookup api-gateway.umbrellapag.com

# Testar com IP direto (substituir pelo IP real)
curl -I https://[IP_DO_SERVIDOR]/api/user/transactions \
  -H "Host: api-gateway.umbrellapag.com" \
  --max-time 10
```

---

## Verificar Logs do Node.js

Ver se há mais detalhes do erro:

```bash
pm2 logs projeto-pay-umbrela-backend --err --lines 50
```

---

## Solução Temporária: Testar Localmente

Enquanto resolve o problema de rede na VPS, pode testar localmente:

```bash
# No seu computador local
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

---

## Contatar Suporte

Se nada funcionar, pode ser:
1. Problema de infraestrutura do provedor da VPS
2. IP da VPS bloqueado pela API UmbrellaPag
3. Necessidade de whitelist do IP na API

