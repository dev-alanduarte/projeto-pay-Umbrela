# 🧪 Testar Após Desativar Firewall

## ✅ Status Atual
- UFW: **inactive** (já estava desativado)

## 🔧 Próximos Passos

### 1. Limpar iptables

```bash
sudo iptables -F
sudo iptables -X
sudo iptables -P INPUT ACCEPT
sudo iptables -P FORWARD ACCEPT
sudo iptables -P OUTPUT ACCEPT
```

### 2. Verificar se limpou

```bash
sudo iptables -L -n -v
```

**Deve mostrar apenas regras padrão (ACCEPT em tudo)**

### 3. Testar Conectividade com API

```bash
cd ~/projeto-pay-Umbrela/backend
npm run test:vps-network
```

**Resultado esperado:**
- ✅ Teste 1 (DNS): OK
- ✅ Teste 2 (HTTPS geral): OK
- ✅ Teste 4 (Requisição real): **DEVE FUNCIONAR AGORA**

### 4. Testar Endpoint do Backend

Se o backend estiver rodando (`npm run dev`), teste:

```bash
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

**Se funcionar:**
- ✅ O problema era o firewall/iptables
- ✅ Precisamos reativar com regras corretas

**Se ainda der timeout:**
- ❌ O problema não é firewall local
- ❌ Pode ser firewall do provedor da VPS
- ❌ Pode ser IP bloqueado pela API

## 📋 Execute e me mostre os resultados!

