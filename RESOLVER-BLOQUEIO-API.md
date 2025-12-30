# 🔧 Resolver Bloqueio da API UmbrellaPag

## ❌ Problema Identificado

- ✅ DNS funciona
- ✅ HTTPS geral funciona (Google)
- ❌ API UmbrellaPag está dando timeout

**Isso indica bloqueio específico da API ou problema temporário.**

---

## 🔍 Diagnóstico Adicional

```bash
# 1. Verificar firewall
iptables -L OUTPUT -n -v | head -20

# 2. Testar conectividade direta com IP da API
curl -v https://52.201.206.133 --max-time 10 -H "Host: api-gateway.umbrellapag.com"

# 3. Testar outro IP da API
curl -v https://3.214.77.131 --max-time 10 -H "Host: api-gateway.umbrellapag.com"

# 4. Ver IP público da VPS
curl ifconfig.me

# 5. Verificar rota até API
traceroute -m 10 api-gateway.umbrellapag.com 2>/dev/null || echo "traceroute não disponível"
```

---

## ✅ Soluções

### 1. Verificar se é Temporário

```bash
# Aguardar 5 minutos e testar novamente
sleep 300
cd ~/projeto-pay-Umbrela/backend
npm run test:vps-network
```

### 2. Verificar Firewall

```bash
# Ver regras de saída
iptables -L OUTPUT -n -v

# Se houver bloqueios, permitir porta 443
# iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT
```

### 3. Contatar Suporte UmbrellaPag

**Se o problema persistir, pode ser que o IP da VPS foi bloqueado.**

Informações para o suporte:
- IP da VPS: `curl ifconfig.me`
- Erro: Timeout ao conectar com `api-gateway.umbrellapag.com`
- DNS resolve corretamente
- HTTPS geral funciona
- Apenas API UmbrellaPag não funciona

---

## 🔄 Tentar Novamente

```bash
# Reiniciar backend e tentar novamente
pm2 restart projeto-pay-umbrela-backend --update-env

# Aguardar alguns minutos
sleep 60

# Testar novamente
cd ~/projeto-pay-Umbrela/backend
npm run test:vps-network
```

---

**Execute os comandos de diagnóstico e me diga o resultado!**

