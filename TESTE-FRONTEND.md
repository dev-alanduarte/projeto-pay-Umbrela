# 🎨 Testar Frontend na VPS

## ✅ Backend Funcionando

A rota `/pix` está gerando QR codes PIX com sucesso!

## 🌐 Acessar Frontend

### Opção 1: Via IP da VPS

```
http://24.152.36.55:3000/produto?payment=10.00
```

### Opção 2: Via Domínio (se configurado)

```
https://seu-dominio.com/produto?payment=10.00
```

### Opção 3: Localmente na VPS

```bash
# Se estiver logado na VPS, pode usar curl ou wget
curl http://localhost:3000/produto?payment=10.00
```

## 🔍 Verificar Logs

```bash
# Ver logs do frontend
pm2 logs projeto-pay-umbrela-frontend --lines 30

# Ver logs do backend (quando frontend fizer requisição)
pm2 logs projeto-pay-umbrela-backend --lines 30
```

## 🧪 Teste Completo

1. Acesse: `http://24.152.36.55:3000/produto?payment=29.99`
2. O frontend deve:
   - Carregar a página
   - Fazer requisição para `/pix` no backend
   - Gerar QR code PIX
   - Mostrar o código para copiar

## 🔧 Se não funcionar

### Verificar se frontend está acessível

```bash
# Testar se porta 3000 está aberta
curl http://localhost:3000

# Verificar firewall
sudo ufw status
sudo ufw allow 3000/tcp
```

### Verificar CORS

Se der erro de CORS, o backend precisa permitir o IP/domínio do frontend.

### Ver logs do navegador

Abra o console do navegador (F12) e veja se há erros.

