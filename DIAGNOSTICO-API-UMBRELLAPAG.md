# 🔍 Diagnóstico: Problema Específico com API UmbrellaPag

## ✅ Conectividade Geral: OK
- VPS consegue acessar HTTPS normalmente
- Google, GitHub, etc. funcionam
- Firewall geral está OK

## ❌ Problema Específico: API UmbrellaPag
- `api-gateway.umbrellapag.com` não responde
- Timeout ao conectar

---

## 🔧 Testes Adicionais

### 1. Verificar DNS do domínio
```bash
nslookup api-gateway.umbrellapag.com
dig api-gateway.umbrellapag.com
```

### 2. Testar com IP direto (se descobrir)
```bash
# Descobrir IP
host api-gateway.umbrellapag.com

# Testar com IP direto
curl -I https://[IP_DESCOBERTO] \
  -H "Host: api-gateway.umbrellapag.com" \
  --max-time 10
```

### 3. Verificar se há bloqueio específico
```bash
# Testar com verbose para ver onde trava
curl -v https://api-gateway.umbrellapag.com/api/user/transactions \
  --max-time 10 \
  -H "x-api-key: SUA_CHAVE_AQUI"
```

### 4. Verificar logs de firewall específicos
```bash
# Ver se há bloqueios específicos
iptables -L OUTPUT -n -v | grep -i umbrella
iptables -L OUTPUT -n -v | grep -i umbrellapag
```

---

## 💡 Possíveis Causas

### 1. IP da VPS Bloqueado pela API
- A API UmbrellaPag pode ter bloqueado o IP da VPS
- **Solução**: Contatar suporte da UmbrellaPag para whitelist

### 2. Rate Limiting ou Proteção DDoS
- A API pode estar bloqueando requisições do IP
- **Solução**: Aguardar ou contatar suporte

### 3. Firewall do Provedor Específico
- Alguns provedores bloqueiam domínios específicos
- **Solução**: Verificar regras de firewall do provedor

### 4. Problema de DNS Específico
- DNS pode não estar resolvendo corretamente
- **Solução**: Usar DNS público (8.8.8.8, 8.8.4.4)

---

## 🛠️ Soluções

### Solução 1: Contatar Suporte UmbrellaPag
```bash
# Descobrir IP da VPS
curl ifconfig.me
# ou
hostname -I

# Enviar IP para suporte da UmbrellaPag
# Solicitar whitelist ou verificar se está bloqueado
```

### Solução 2: Usar Proxy/Túnel
Se a API estiver bloqueando o IP, usar um proxy:

```bash
# Instalar proxychains (exemplo)
apt-get install proxychains

# Configurar proxy
# Editar /etc/proxychains.conf

# Testar com proxy
proxychains curl -I https://api-gateway.umbrellapag.com
```

### Solução 3: Verificar se há VPN/Proxy Necessário
Algumas APIs requerem conexão através de VPN ou proxy específico.

### Solução 4: Testar de Outro Servidor
Testar de outro servidor/IP para confirmar se é bloqueio do IP da VPS.

---

## 📋 Informações para Suporte UmbrellaPag

Ao contatar o suporte, forneça:

1. **IP da VPS**: `curl ifconfig.me`
2. **Domínio**: `api-gateway.umbrellapag.com`
3. **Erro**: `Connection timed out`
4. **Teste de conectividade**: Google funciona, API não
5. **Timestamp**: Quando começou o problema

---

## ✅ Próximos Passos

1. **Executar testes acima** para coletar mais informações
2. **Contatar suporte UmbrellaPag** com as informações
3. **Verificar se há whitelist necessária** para o IP
4. **Considerar usar proxy/túnel** como solução temporária

---

## 🔄 Alternativa Temporária

Enquanto resolve o problema de conectividade:

- **Usar servidor local** (já está funcionando)
- **Configurar túnel reverso** (ngrok, cloudflared, etc.)
- **Usar outro servidor** com conectividade adequada

