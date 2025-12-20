# 🔒 Guia de Configuração SSL/HTTPS

## Pré-requisitos:
1. Domínio apontando para o IP da VPS (24.152.36.55)
2. Portas 80 e 443 abertas no firewall
3. Nginx instalado (opcional, mas recomendado)

## Opção 1: Usando Nginx (Recomendado)

### 1. Instalar Certbot:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Configurar Nginx para o domínio:

Crie/edite o arquivo de configuração do Nginx:

```bash
sudo nano /etc/nginx/sites-available/seu-dominio.com
```

Cole este conteúdo (substitua `seu-dominio.com` pelo seu domínio):

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Frontend (porta 3000)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (porta 3001)
    location /pix {
        proxy_pass http://localhost:3001/pix;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://localhost:3001/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### 3. Ativar o site:

```bash
sudo ln -s /etc/nginx/sites-available/seu-dominio.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Gerar certificado SSL:

```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

Siga as instruções:
- Digite seu email
- Aceite os termos (A)
- Escolha se quer redirecionar HTTP para HTTPS (2 é recomendado)

### 5. Verificar renovação automática:

```bash
sudo certbot renew --dry-run
```

## Opção 2: Sem Nginx (Standalone)

Se não quiser usar Nginx, pode gerar o certificado diretamente:

### 1. Instalar Certbot:

```bash
sudo apt update
sudo apt install certbot -y
```

### 2. Parar temporariamente os serviços que usam porta 80:

```bash
# Parar frontend e backend temporariamente
pm2 stop all
# Ou se usar Nginx:
sudo systemctl stop nginx
```

### 3. Gerar certificado:

```bash
sudo certbot certonly --standalone -d seu-dominio.com -d www.seu-dominio.com
```

### 4. Reiniciar serviços:

```bash
pm2 start all
# Ou
sudo systemctl start nginx
```

### 5. Configurar renovação automática:

O Certbot cria um timer automático, mas você pode testar:

```bash
sudo certbot renew --dry-run
```

## Configurar renovação automática:

O Certbot já configura renovação automática, mas você pode verificar:

```bash
sudo systemctl status certbot.timer
```

## Localização dos certificados:

Os certificados ficam em:
```
/etc/letsencrypt/live/seu-dominio.com/
├── fullchain.pem  (certificado + chain)
├── privkey.pem    (chave privada)
├── cert.pem       (certificado)
└── chain.pem      (chain)
```

## Renovar manualmente (se necessário):

```bash
sudo certbot renew
```

## Verificar certificado:

```bash
sudo certbot certificates
```

## Troubleshooting:

### Erro: "Failed to connect"
- Verifique se o domínio está apontando para o IP correto
- Verifique se as portas 80 e 443 estão abertas

### Erro: "Too many requests"
- Let's Encrypt tem limite de 5 certificados por domínio por semana
- Aguarde ou use `--staging` para testes

### Testar com staging (sem limite):

```bash
sudo certbot --nginx -d seu-dominio.com --staging
```

