#!/bin/bash
# Script para configurar HTTPS no Nginx

DOMAIN="checkout.pagamentoseguromarketplace.com"
NGINX_CONFIG="/etc/nginx/sites-available/checkout-pagamento"

echo "Configurando HTTPS para $DOMAIN..."

# Verificar se a porta 443 está aberta
if ! netstat -tulpn | grep -q ":443 "; then
    echo "Aviso: Porta 443 não está escutando. Verificando firewall..."
    ufw allow 80/tcp
    ufw allow 443/tcp
fi

# Tentar obter certificado com Certbot
echo "Tentando obter certificado SSL..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@pagamentoseguromarketplace.com --redirect

if [ $? -eq 0 ]; then
    echo "✅ Certificado SSL instalado com sucesso!"
    echo "Testando configuração..."
    nginx -t && systemctl reload nginx
    echo "✅ HTTPS configurado! Acesse: https://$DOMAIN"
else
    echo "❌ Erro ao obter certificado. Tentando modo standalone..."
    systemctl stop nginx
    certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email admin@pagamentoseguromarketplace.com
    systemctl start nginx
    
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        echo "✅ Certificado obtido! Configure o Nginx manualmente."
    else
        echo "❌ Falha ao obter certificado. Verifique os logs: /var/log/letsencrypt/letsencrypt.log"
    fi
fi


