# 🔧 Solução para Timeout na VPS

## ✅ Diagnóstico Completo

- ✅ DNS funcionando (resolve corretamente)
- ✅ Firewall local OK (porta 443 liberada)
- ❌ **Conexão TCP na porta 443 dá timeout**

## 🎯 Causa Provável

A conexão TCP na porta 443 está sendo bloqueada **antes de chegar na API**. Isso indica:

1. **Firewall do Provedor da VPS** bloqueando saída HTTPS
2. **IP da VPS bloqueado** pela API UmbrellaPag ou pelo provedor
3. **Problema de roteamento** de rede

## 🔍 Testes Adicionais

Execute na VPS:

```bash
# 1. Testar se outros sites HTTPS funcionam
curl -I https://www.google.com --max-time 5
curl -I https://github.com --max-time 5

# 2. Ver IP da VPS
curl ifconfig.me

# 3. Testar IP direto da API
curl -I https://52.201.206.133 --max-time 5 -H "Host: api-gateway.umbrellapag.com"

# 4. Verificar rota
traceroute api-gateway.umbrellapag.com
```

## 💡 Soluções

### Solução 1: Contatar Provedor da VPS

Se outros sites HTTPS também não funcionarem, o problema é do provedor:
- Verificar Security Groups / Firewall Rules
- Solicitar liberação de saída HTTPS (porta 443)

### Solução 2: Contatar Suporte UmbrellaPag

Se outros sites HTTPS funcionarem, o problema é específico da API:
- Enviar IP da VPS: `curl ifconfig.me`
- Solicitar whitelist do IP
- Verificar se há restrições de acesso

### Solução 3: Usar Proxy/Túnel

Como solução temporária:
- Configurar proxy HTTP/HTTPS
- Usar túnel reverso (ngrok, cloudflared)
- Usar outro servidor com conectividade adequada

### Solução 4: Verificar Firewall do Provedor

Se estiver usando AWS, DigitalOcean, etc:
- Verificar **Security Groups**
- Verificar **Network ACLs**
- Permitir tráfego HTTPS de saída (porta 443)

## 📋 Informações para Suporte

Ao contatar suporte, forneça:

1. **IP da VPS**: `curl ifconfig.me`
2. **Teste DNS**: `nslookup api-gateway.umbrellapag.com`
3. **Teste de conectividade**: Resultado do `curl -v`
4. **Provedor da VPS**: (AWS, DigitalOcean, etc)
5. **Erro específico**: "Connection timed out na porta 443"

