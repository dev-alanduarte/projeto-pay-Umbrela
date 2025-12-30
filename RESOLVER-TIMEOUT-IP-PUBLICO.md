# 🔧 Resolver Timeout ao Acessar via IP Público

## ❌ Problema

Requisição para `http://24.152.36.55:3001/pix` está dando timeout após 30+ segundos.

**Isso indica que:**
- O backend está acessível (não é connection refused)
- Mas está dando timeout ao processar (provavelmente ao conectar com API UmbrellaPag)

---

## 🔍 Diagnóstico na VPS

```bash
# 1. Verificar se backend está rodando
pm2 status

# 2. Ver logs do backend (últimas 50 linhas)
pm2 logs projeto-pay-umbrela-backend --lines 50

# 3. Ver apenas erros
pm2 logs projeto-pay-umbrela-backend --err --lines 50

# 4. Testar localmente na VPS
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

---

## ✅ Soluções

### 1. Se Backend Não Estiver Rodando

```bash
cd ~/projeto-pay-Umbrela
pm2 restart projeto-pay-umbrela-backend --update-env
pm2 save
```

### 2. Se Backend Estiver Rodando mas Dando Timeout

```bash
# Verificar se é problema de conectividade com API
cd ~/projeto-pay-Umbrela/backend
npm run test:vps-network

# Se teste passar, pode ser problema temporário
# Reiniciar backend
pm2 restart projeto-pay-umbrela-backend --update-env
```

### 3. Verificar Firewall

```bash
# Verificar se porta 3001 está aberta
netstat -tulpn | grep 3001

# Se não estiver escutando em 0.0.0.0, pode ser problema de binding
# Verificar código do servidor
```

---

## 🔧 Verificar Binding do Servidor

O servidor precisa escutar em `0.0.0.0` (todas as interfaces) e não apenas `localhost`:

```javascript
// ✅ Correto
app.listen(3001, '0.0.0.0', () => {
  console.log(`Backend running on http://0.0.0.0:3001`);
});

// ❌ Errado (só aceita localhost)
app.listen(3001, () => {
  console.log(`Backend running on http://localhost:3001`);
});
```

---

## 📝 Comandos Rápidos

```bash
# Verificar status e logs
pm2 status
pm2 logs projeto-pay-umbrela-backend --lines 30

# Testar localmente
curl -X POST http://localhost:3001/pix -H "Content-Type: application/json" -d '{"amount": 10.00}'

# Se local funcionar mas IP público não, verificar binding
grep -A 2 "app.listen" ~/projeto-pay-Umbrela/backend/src/server.js
```

---

**Execute os comandos de diagnóstico e me mostre os logs!**

