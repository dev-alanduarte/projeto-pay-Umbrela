# ✅ Verificar Arquivo .env

## 📋 O que deve estar no `.env` do backend:

```env
PORT=3001
NODE_ENV=production
UMBRELLAPAG_API_KEY=sua_chave_api_aqui
POSTBACK_URL=https://webhook.site/unique-id
```

---

## 🔍 Verificar na VPS:

```bash
# Ver conteúdo do .env (CUIDADO: não compartilhe a chave!)
cat ~/projeto-pay-Umbrela/backend/.env

# Verificar se UMBRELLAPAG_API_KEY está configurada
grep UMBRELLAPAG_API_KEY ~/projeto-pay-Umbrela/backend/.env
```

---

## ✅ Checklist:

- [ ] `UMBRELLAPAG_API_KEY` está presente
- [ ] `PORT=3001` está configurado
- [ ] `NODE_ENV=production` está configurado
- [ ] `POSTBACK_URL` está configurado (opcional)

---

## 🔄 Se Precisar Atualizar:

```bash
cd ~/projeto-pay-Umbrela/backend
nano .env
# Editar e salvar (Ctrl+X, Y, Enter)

# Reiniciar backend para carregar novas variáveis
pm2 restart projeto-pay-umbrela-backend --update-env
```

---

**Verifique se o `.env` tem a chave `UMBRELLAPAG_API_KEY` configurada!**

