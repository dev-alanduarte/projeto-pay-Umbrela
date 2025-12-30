# 📊 Status: Funcionando Localmente, Problema na VPS

## ✅ O que está funcionando

- **Código**: 100% funcional
- **Local**: Gerando QR codes PIX com sucesso
- **API UmbrellaPag**: Respondendo corretamente
- **Rotação de CPF**: Funcionando
- **Geração de dados aleatórios**: Funcionando

## ❌ Problema na VPS

**Erro**: `Connection timed out` ao acessar `api-gateway.umbrellapag.com`

A VPS não consegue conectar à API UmbrellaPag (problema de rede/firewall).

---

## 🔧 Soluções para VPS

### Opção 1: Verificar e Liberar Firewall

```bash
# Verificar regras de firewall
iptables -L OUTPUT -n -v

# Liberar saída HTTPS (porta 443)
iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT
iptables-save

# Testar novamente
curl -I https://api-gateway.umbrellapag.com --max-time 10
```

### Opção 2: Verificar Firewall do Provedor

Se estiver usando AWS, DigitalOcean, etc:
- Verificar **Security Groups**
- Verificar **Network ACLs**
- Permitir tráfego HTTPS de saída (porta 443)

### Opção 3: Verificar se IP está Bloqueado

A API UmbrellaPag pode estar bloqueando o IP da VPS:
- Contatar suporte da UmbrellaPag
- Solicitar whitelist do IP da VPS

### Opção 4: Usar Proxy (se necessário)

Se a VPS estiver atrás de um proxy:

```bash
# Configurar proxy no sistema
export HTTP_PROXY=http://proxy:porta
export HTTPS_PROXY=http://proxy:porta

# Ou configurar no Node.js
# Adicionar no .env ou no código
```

### Opção 5: Testar DNS

```bash
# Verificar DNS
nslookup api-gateway.umbrellapag.com

# Se não resolver, usar DNS público
echo "nameserver 8.8.8.8" >> /etc/resolv.conf
echo "nameserver 8.8.4.4" >> /etc/resolv.conf
```

---

## 🧪 Testes de Diagnóstico

Execute na VPS para identificar o problema:

```bash
# 1. Testar conectividade geral HTTPS
curl -I https://www.google.com --max-time 10
curl -I https://github.com --max-time 10

# 2. Se funcionar, o problema é específico da API UmbrellaPag
# Se não funcionar, é problema geral de rede/firewall

# 3. Testar DNS
nslookup api-gateway.umbrellapag.com
dig api-gateway.umbrellapag.com

# 4. Verificar firewall
iptables -L -n -v
```

---

## 📝 Próximos Passos

1. **Diagnosticar**: Executar testes acima na VPS
2. **Resolver**: Aplicar solução conforme diagnóstico
3. **Testar**: Após resolver, testar a rota `/pix` novamente

---

## 💡 Alternativa Temporária

Se precisar usar imediatamente enquanto resolve o problema de rede:

- Usar o servidor local (já está funcionando)
- Ou configurar um túnel/proxy reverso
- Ou usar outro servidor com conectividade adequada

---

## ✅ Código está Pronto

O código está 100% funcional. O problema é apenas de infraestrutura/rede na VPS.

