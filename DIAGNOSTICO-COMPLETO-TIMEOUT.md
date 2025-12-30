# 🔍 Diagnóstico Completo - Timeout via IP Público

## ❌ Problema Atual

Requisição para `http://24.152.36.55:3001/pix` está dando timeout após 30 segundos.

---

## ✅ Passo 1: Atualizar Código na VPS

```bash
cd ~/projeto-pay-Umbrela
git pull origin main
```

**Verificar se a mudança foi aplicada:**
```bash
grep -A 3 "app.listen" backend/src/server.js
```

**Deve mostrar:**
```javascript
app.listen(port, '0.0.0.0', () => {
```

---

## ✅ Passo 2: Reiniciar Backend

```bash
# Limpar PM2
pm2 kill
pm2 delete all

# Reiniciar
cd ~/projeto-pay-Umbrela
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

---

## ✅ Passo 3: Verificar se Está Escutando Corretamente

```bash
# Verificar se porta 3001 está escutando em 0.0.0.0
netstat -tulpn | grep 3001
```

**Deve mostrar algo como:**
```
tcp6  0  0 :::3001  :::*  LISTEN  <PID>/node
```

**Se mostrar `127.0.0.1:3001` ao invés de `:::3001`, o servidor não está escutando em todas as interfaces.**

---

## ✅ Passo 4: Verificar Firewall

```bash
# Verificar regras de firewall
iptables -L -n -v | grep 3001

# Se não houver regra, adicionar (se necessário)
# iptables -A INPUT -p tcp --dport 3001 -j ACCEPT
```

---

## ✅ Passo 5: Testar Localmente na VPS

```bash
# Testar se funciona localmente
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

**Se funcionar localmente mas não via IP público:**
- Problema de firewall ou binding
- Verificar logs: `pm2 logs projeto-pay-umbrela-backend --lines 30`

---

## ✅ Passo 6: Verificar Logs

```bash
# Ver logs em tempo real
pm2 logs projeto-pay-umbrela-backend --lines 50

# Ver se há erros
pm2 logs projeto-pay-umbrela-backend --err --lines 50
```

**Procurar por:**
- `Backend running on http://0.0.0.0:3001` (deve aparecer)
- Erros de conexão com API UmbrellaPag
- Timeouts

---

## 🔧 Se Ainda Der Timeout

### Opção 1: Verificar se Requisição Chega ao Servidor

```bash
# Fazer requisição e ver logs simultaneamente
pm2 logs projeto-pay-umbrela-backend --lines 0 &
curl -X POST http://24.152.36.55:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

**Se não aparecer nada nos logs, a requisição não está chegando ao servidor (firewall/proxy).**

### Opção 2: Testar Conectividade com API

```bash
cd ~/projeto-pay-Umbrela/backend
npm run test:vps-network
```

**Se o teste passar, o problema pode ser:**
- Muitas requisições simultâneas
- Rate limiting da API
- Problema temporário

---

## 📝 Checklist Completo

- [ ] Código atualizado (`git pull`)
- [ ] Servidor escutando em `0.0.0.0` (verificar código)
- [ ] Backend reiniciado (`pm2 restart`)
- [ ] Porta 3001 escutando em todas as interfaces (`netstat`)
- [ ] Firewall permitindo porta 3001
- [ ] Teste local funciona (`curl localhost:3001/pix`)
- [ ] Logs mostram requisições chegando
- [ ] Conectividade com API UmbrellaPag OK (`npm run test:vps-network`)

---

**Execute os passos na ordem e me diga em qual passo parou ou qual erro apareceu!**

