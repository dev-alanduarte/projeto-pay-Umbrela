# 🧪 Testar Frontend na VPS

## ✅ Status Atual

- **Backend:** Funcionando em `http://24.152.36.55:3001/pix`
- **Frontend:** Deve estar rodando na porta 3000

---

## 🔍 Passo 1: Verificar se Frontend está Rodando

```bash
# Ver status do PM2
pm2 status

# Ver logs do frontend
pm2 logs projeto-pay-umbrela-frontend --lines 20
```

**Se não estiver rodando:**
```bash
cd ~/projeto-pay-Umbrela
pm2 restart projeto-pay-umbrela-frontend
```

---

## 🌐 Passo 2: Testar Acesso ao Frontend

### Opção A: Via IP Direto

Acesse no navegador:
```
http://24.152.36.55:3000/produto?payment=10.00
```

### Opção B: Via IP Direto (sem parâmetro)

```
http://24.152.36.55:3000/produto
```

### Opção C: Rota Alternativa

```
http://24.152.36.55:3000/?payment=29.99
```

---

## 🔧 Como o Frontend Detecta o Backend

O frontend detecta automaticamente:

- **Se hostname = localhost ou 127.0.0.1:**
  - Backend: `http://localhost:3001`

- **Se hostname = IP público (24.152.36.55):**
  - Backend: `http://24.152.36.55:3001`

**Isso significa que ao acessar via IP público, o frontend vai tentar conectar com o backend no mesmo IP!**

---

## ✅ Teste Completo

1. **Acesse no navegador:**
   ```
   http://24.152.36.55:3000/produto?payment=10.00
   ```

2. **Abra o Console do Navegador (F12):**
   - Deve mostrar: `🔧 Backend URL: http://24.152.36.55:3001`
   - Deve mostrar: `📤 Enviando requisição para: http://24.152.36.55:3001/pix`

3. **Verifique se o QR Code aparece**

4. **Se der erro CORS:**
   - O backend precisa permitir requisições do frontend
   - Verificar configuração CORS no `backend/src/server.js`

---

## 🐛 Problemas Comuns

### ❌ "Failed to fetch" ou Erro CORS

**Solução:** Verificar se o backend permite requisições do frontend:

```bash
# Ver logs do backend
pm2 logs projeto-pay-umbrela-backend --lines 30

# Verificar se há erro de CORS
```

### ❌ Frontend não carrega

**Solução:**
```bash
# Verificar se frontend está rodando
pm2 status

# Reiniciar frontend
pm2 restart projeto-pay-umbrela-frontend

# Ver logs
pm2 logs projeto-pay-umbrela-frontend
```

### ❌ QR Code não aparece

**Solução:**
1. Abrir Console do Navegador (F12)
2. Verificar erros no console
3. Verificar se a requisição para `/pix` foi feita
4. Verificar resposta da API no Network tab

---

## 📝 Verificar CORS no Backend

O backend já deve estar configurado para aceitar requisições de qualquer origem, mas vamos verificar:

```bash
# Ver código CORS
grep -A 5 "cors" ~/projeto-pay-Umbrela/backend/src/server.js
```

**Deve ter algo como:**
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', ...]
}));
```

**Se precisar adicionar o IP público:**
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://24.152.36.55:3000']
}));
```

---

## ✅ Checklist de Teste

- [ ] Frontend rodando (`pm2 status` mostra online)
- [ ] Acessar `http://24.152.36.55:3000/produto?payment=10.00`
- [ ] Página carrega sem erros
- [ ] Console do navegador mostra `🔧 Backend URL: http://24.152.36.55:3001`
- [ ] Requisição para `/pix` é feita
- [ ] QR Code aparece na tela
- [ ] QR Code pode ser escaneado

---

**Execute os testes e me diga o resultado!**

