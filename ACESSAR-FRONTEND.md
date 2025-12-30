# 🌐 Como Acessar o Frontend

## 📍 URLs de Acesso

### Via IP Público da VPS:
```
http://24.152.36.55:3000/produto?payment=29.99
```

### Localmente na VPS:
```
http://localhost:3000/produto?payment=29.99
```

## 🔍 Verificar se o Frontend Está Rodando

```bash
# Ver status do PM2
pm2 status

# Deve mostrar:
# ┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
# │ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
# ├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
# │ 0  │ projeto-pay-umbre… │ fork     │ 0    │ online    │ 0%       │ XX.Xmb   │
# │ 1  │ projeto-pay-umbre…│ fork     │ 0    │ online    │ 0%       │ XX.Xmb   │ ← Frontend
# └────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

## 🚀 Se o Frontend Não Estiver Rodando

```bash
# Verificar logs de erro
pm2 logs projeto-pay-umbrela-frontend --err --lines 20

# Se estiver com erro, reiniciar
pm2 restart projeto-pay-umbrela-frontend

# Ou iniciar novamente
cd ~/projeto-pay-Umbrela
pm2 start ecosystem.config.js
```

## 🧪 Testar Frontend Localmente na VPS

```bash
# Testar se o servidor está respondendo
curl http://localhost:3000/produto?payment=10.00

# Deve retornar HTML da página
```

## 🌍 Acessar do Navegador

1. **Abra o navegador**
2. **Digite a URL:**
   ```
   http://24.152.36.55:3000/produto?payment=29.99
   ```
3. **Ou use qualquer valor:**
   ```
   http://24.152.36.55:3000/produto?payment=50.00
   ```

## ⚠️ Se Não Conseguir Acessar

### 1. Verificar se a Porta 3000 Está Aberta

```bash
# Verificar se o servidor está escutando
netstat -tulpn | grep 3000
# ou
lsof -i :3000

# Deve mostrar algo como:
# node    1234  ...  LISTEN  0.0.0.0:3000
```

### 2. Verificar Firewall

```bash
# Se estiver usando UFW
sudo ufw status
sudo ufw allow 3000/tcp

# Se estiver usando iptables
sudo iptables -L INPUT -n -v | grep 3000
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

### 3. Verificar Logs do Frontend

```bash
pm2 logs projeto-pay-umbrela-frontend --lines 30
```

**Deve mostrar:**
```
Frontend server running on http://localhost:3000
Access: http://localhost:3000/produto?payment=10.00
```

## 📱 Exemplo de URLs

```
# Valor de R$ 10,00
http://24.152.36.55:3000/produto?payment=10.00

# Valor de R$ 29,99
http://24.152.36.55:3000/produto?payment=29.99

# Valor de R$ 100,00
http://24.152.36.55:3000/produto?payment=100.00
```

## ✅ Checklist

- [ ] Frontend está rodando no PM2 (status: online)
- [ ] Porta 3000 está aberta no firewall
- [ ] Servidor está escutando em `0.0.0.0:3000` (não apenas localhost)
- [ ] Backend está rodando na porta 3001
- [ ] Consegue acessar via navegador

## 🔧 Se o Frontend Não Estiver Escutando em 0.0.0.0

O `frontend/server.js` precisa escutar em `0.0.0.0` para aceitar conexões externas:

```javascript
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on http://0.0.0.0:${PORT}`);
});
```

