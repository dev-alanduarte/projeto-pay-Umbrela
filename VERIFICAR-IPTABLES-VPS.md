# 🔍 Verificar iptables na VPS

## ⚠️ Problema: Teste direto ainda dá timeout

Mesmo após limpar iptables, o teste ainda está dando timeout. Vamos verificar se o iptables foi realmente limpo.

## 🔍 Verificar Status do iptables

```bash
# Ver todas as regras
sudo iptables -L -n -v

# Ver regras de saída (OUTPUT) - CRÍTICO para conexões HTTPS
sudo iptables -L OUTPUT -n -v

# Ver regras de entrada (INPUT)
sudo iptables -L INPUT -n -v
```

**O que deve aparecer:**
- `Chain OUTPUT (policy ACCEPT)` - Deve estar ACCEPT
- `Chain INPUT (policy ACCEPT)` - Deve estar ACCEPT
- Sem regras bloqueando (sem DROP ou REJECT)

## 🧹 Limpar iptables Completamente (Novamente)

```bash
# Limpar todas as regras
sudo iptables -F
sudo iptables -X
sudo iptables -t nat -F
sudo iptables -t nat -X
sudo iptables -t mangle -F
sudo iptables -t mangle -X

# Definir políticas padrão como ACCEPT
sudo iptables -P INPUT ACCEPT
sudo iptables -P FORWARD ACCEPT
sudo iptables -P OUTPUT ACCEPT

# Verificar
sudo iptables -L -n -v
```

## 🔄 Testar Novamente

```bash
cd ~/projeto-pay-Umbrela/backend
npm run test:umbrellapag
```

## 💡 Se Ainda Não Funcionar

Pode ser:
1. **Firewall do provedor da VPS** (não é iptables local)
2. **IP bloqueado pela API UmbrellaPag**
3. **Problema de roteamento de rede**

Nesse caso, você precisa:
- Contatar o provedor da VPS
- Contatar suporte UmbrellaPag para whitelist do IP

