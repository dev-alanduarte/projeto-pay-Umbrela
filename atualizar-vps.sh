#!/bin/bash

# Script para atualizar o projeto na VPS
# Uso: ./atualizar-vps.sh

echo "🚀 Iniciando atualização na VPS..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Fazer pull do GitHub
echo -e "${YELLOW}📥 Fazendo pull do GitHub...${NC}"
git pull origin main
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao fazer pull${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Pull concluído${NC}"

# 2. Instalar dependências do backend
echo -e "${YELLOW}📦 Instalando dependências do backend...${NC}"
cd backend
npm install --production
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao instalar dependências do backend${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}✅ Dependências do backend instaladas${NC}"

# 3. Reiniciar backend com PM2
echo -e "${YELLOW}🔄 Reiniciando backend...${NC}"
pm2 restart projeto-pay-umbrela-backend
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  PM2 não encontrou o processo, tentando iniciar...${NC}"
    pm2 start ecosystem.config.js
fi
echo -e "${GREEN}✅ Backend reiniciado${NC}"

# 4. Aplicar configuração do Nginx
echo -e "${YELLOW}⚙️  Aplicando configuração do Nginx...${NC}"
if [ -f "nginx-https.conf" ]; then
    # Copia o arquivo de configuração
    sudo cp nginx-https.conf /etc/nginx/sites-available/pagamentoseguromarketplace.com
    
    # Testa a configuração
    sudo nginx -t
    if [ $? -eq 0 ]; then
        # Recarrega o nginx
        sudo systemctl reload nginx
        echo -e "${GREEN}✅ Nginx atualizado e recarregado${NC}"
    else
        echo -e "${RED}❌ Erro na configuração do Nginx. Verifique o arquivo.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Arquivo nginx-https.conf não encontrado. Pulando atualização do Nginx.${NC}"
fi

# 5. Mostrar status
echo -e "${YELLOW}📊 Status dos processos:${NC}"
pm2 status

echo -e "${GREEN}✅ Atualização concluída!${NC}"
echo -e "${YELLOW}💡 Teste acessando: https://pagamentoseguromarketplace.com/produto?payment=29.99${NC}"

