#!/bin/bash
# Script para atualizar o código na VPS

echo "🚀 Iniciando atualização na VPS..."
echo "=================================="

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar se está no diretório correto
if [ ! -f "ecosystem.config.js" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto${NC}"
    exit 1
fi

# 2. Verificar status do Git
echo -e "${YELLOW}📋 Verificando status do Git...${NC}"
git status

# 3. Puxar mudanças do GitHub
echo -e "${YELLOW}📥 Puxando mudanças do GitHub...${NC}"
git pull umbrela main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao puxar mudanças do GitHub${NC}"
    exit 1
fi

# 4. Instalar dependências do backend
echo -e "${YELLOW}📦 Instalando dependências do backend...${NC}"
cd backend
npm install --production
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao instalar dependências${NC}"
    exit 1
fi
cd ..

# 5. Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ PM2 não está instalado. Instale com: npm install -g pm2${NC}"
    exit 1
fi

# 6. Reiniciar aplicações PM2
echo -e "${YELLOW}🔄 Reiniciando aplicações PM2...${NC}"
pm2 restart ecosystem.config.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Servidor reiniciado com sucesso!${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 restart falhou, tentando start...${NC}"
    pm2 start ecosystem.config.js
fi

# 7. Mostrar status
echo -e "${YELLOW}📊 Status das aplicações:${NC}"
pm2 status

# 8. Mostrar últimos logs
echo -e "${YELLOW}📋 Últimos logs (últimas 20 linhas):${NC}"
pm2 logs --lines 20 --nostream

echo ""
echo -e "${GREEN}✅ Atualização concluída!${NC}"
echo "=================================="

