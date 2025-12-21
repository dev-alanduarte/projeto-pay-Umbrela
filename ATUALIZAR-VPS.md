# 🚀 Guia Rápido para Atualizar na VPS

## Passo a Passo para Atualizar

### 1. Conectar na VPS via SSH

```bash
ssh usuario@seu-ip-vps
# ou
ssh usuario@pagamentoseguromarketplace.com
```

### 2. Ir para o diretório do projeto

```bash
cd /var/www/projeto-pay-umbrela
# ou o caminho onde está seu projeto
```

### 3. Fazer pull das mudanças do GitHub

```bash
git pull origin main
```

### 4. Instalar dependências (se necessário)

```bash
# Backend
cd backend
npm install --production
cd ..

# Frontend (se necessário)
cd frontend
npm install --production
cd ..
```

### 5. Reiniciar o backend com PM2

```bash
pm2 restart projeto-pay-umbrela-backend
# ou
pm2 restart all
```

### 6. Aplicar configuração do Nginx

```bash
# Copiar o arquivo nginx-https.conf para o local correto
sudo cp nginx-https.conf /etc/nginx/sites-available/pagamentoseguromarketplace.com
# ou editar diretamente:
sudo nano /etc/nginx/sites-available/pagamentoseguromarketplace.com

# Testar a configuração
sudo nginx -t

# Se estiver OK, recarregar o nginx
sudo systemctl reload nginx
```

### 7. Verificar se está funcionando

```bash
# Ver logs do backend
pm2 logs projeto-pay-umbrela-backend

# Ver status
pm2 status

# Testar a URL
curl https://pagamentoseguromarketplace.com/produto?payment=29.99
```

## Comandos Úteis

```bash
# Ver processos PM2
pm2 list

# Ver logs em tempo real
pm2 logs

# Reiniciar tudo
pm2 restart all

# Verificar nginx
sudo nginx -t
sudo systemctl status nginx

# Ver logs do nginx
sudo tail -f /var/log/nginx/error.log
```

## ⚠️ Importante

- Sempre teste a configuração do nginx antes de recarregar (`sudo nginx -t`)
- Verifique os logs se algo não funcionar (`pm2 logs`)
- A rota `/produto` precisa estar configurada no nginx para funcionar

