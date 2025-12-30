# 🚀 Setup Inicial na VPS

## Passo 1: Instalar Dependências

```bash
# Backend
cd backend
npm install --production
cd ..

# Frontend
cd frontend
npm install --production
cd ..
```

## Passo 2: Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env no backend
cd backend
nano .env
```

Adicione:
```
UMBRELLAPAG_API_KEY=sua_chave_aqui
POSTBACK_URL=https://webhook.site/unique-id
PORT=3001
NODE_ENV=production
```

Salve e saia (Ctrl+X, Y, Enter)

## Passo 3: Criar Diretório de Logs

```bash
cd ~/projeto-pay-Umbrela
mkdir -p logs
```

## Passo 4: Iniciar com PM2

```bash
# Instalar PM2 globalmente (se não tiver)
npm install -g pm2

# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Verificar status
pm2 status

# Ver logs
pm2 logs
```

## Passo 5: Testar

```bash
# Testar backend
curl -X POST http://localhost:3001/pix \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00}'
```

## Passo 6: Configurar Nginx (se necessário)

```bash
# Copiar configuração
sudo cp nginx-https.conf /etc/nginx/sites-available/pagamento
sudo ln -s /etc/nginx/sites-available/pagamento /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

## Comandos Úteis

```bash
# Ver logs
pm2 logs projeto-pay-umbrela-backend
pm2 logs projeto-pay-umbrela-frontend

# Reiniciar
pm2 restart all

# Parar
pm2 stop all

# Ver status
pm2 status
```

