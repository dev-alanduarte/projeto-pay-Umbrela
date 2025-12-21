#!/bin/bash

# Script de diagnóstico para erro 502 Bad Gateway
# Uso: ./diagnostico-502.sh

echo "🔍 Diagnosticando erro 502 Bad Gateway..."
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Verificar PM2
echo -e "${YELLOW}1. Verificando status do PM2...${NC}"
pm2 status
echo ""

# 2. Verificar se backend está rodando
echo -e "${YELLOW}2. Verificando se backend está rodando...${NC}"
BACKEND_STATUS=$(pm2 jlist | grep -o '"name":"projeto-pay-umbrela-backend"[^}]*"pm2_env":{"status":"[^"]*' | grep -o '"status":"[^"]*' | cut -d'"' -f4)
if [ "$BACKEND_STATUS" = "online" ]; then
    echo -e "${GREEN}✅ Backend está online${NC}"
else
    echo -e "${RED}❌ Backend NÃO está online. Status: $BACKEND_STATUS${NC}"
    echo -e "${YELLOW}Tentando reiniciar...${NC}"
    pm2 restart projeto-pay-umbrela-backend
    sleep 2
fi
echo ""

# 3. Verificar porta 3001
echo -e "${YELLOW}3. Verificando se porta 3001 está em uso...${NC}"
if netstat -tlnp 2>/dev/null | grep -q ":3001" || ss -tlnp 2>/dev/null | grep -q ":3001"; then
    echo -e "${GREEN}✅ Porta 3001 está em uso${NC}"
    netstat -tlnp 2>/dev/null | grep ":3001" || ss -tlnp 2>/dev/null | grep ":3001"
else
    echo -e "${RED}❌ Porta 3001 NÃO está em uso${NC}"
    echo -e "${YELLOW}O backend não está escutando na porta 3001${NC}"
fi
echo ""

# 4. Testar conexão com backend
echo -e "${YELLOW}4. Testando conexão com backend (localhost:3001/health)...${NC}"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health 2>/dev/null)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Backend está respondendo (HTTP $HEALTH_RESPONSE)${NC}"
    curl -s http://localhost:3001/health | head -1
else
    echo -e "${RED}❌ Backend NÃO está respondendo (HTTP $HEALTH_RESPONSE)${NC}"
fi
echo ""

# 5. Verificar logs do backend
echo -e "${YELLOW}5. Últimas linhas dos logs do backend:${NC}"
pm2 logs projeto-pay-umbrela-backend --lines 10 --nostream 2>/dev/null || echo "Não foi possível ler logs"
echo ""

# 6. Verificar logs do Nginx
echo -e "${YELLOW}6. Últimas linhas dos logs de erro do Nginx:${NC}"
sudo tail -10 /var/log/nginx/error.log 2>/dev/null || echo "Não foi possível ler logs do Nginx"
echo ""

# 7. Verificar configuração do Nginx
echo -e "${YELLOW}7. Verificando configuração do Nginx para /pix...${NC}"
if sudo grep -q "proxy_pass.*3001" /etc/nginx/sites-available/pagamentoseguromarketplace.com 2>/dev/null; then
    echo -e "${GREEN}✅ Nginx está configurado para proxy na porta 3001${NC}"
    sudo grep "proxy_pass.*3001" /etc/nginx/sites-available/pagamentoseguromarketplace.com | head -1
else
    echo -e "${RED}❌ Nginx NÃO está configurado corretamente${NC}"
fi
echo ""

# 8. Testar configuração do Nginx
echo -e "${YELLOW}8. Testando configuração do Nginx...${NC}"
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✅ Configuração do Nginx está OK${NC}"
else
    echo -e "${RED}❌ Configuração do Nginx tem erros:${NC}"
    sudo nginx -t
fi
echo ""

# Resumo
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📋 RESUMO:${NC}"
echo ""

if [ "$BACKEND_STATUS" = "online" ] && [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Backend parece estar funcionando corretamente${NC}"
    echo -e "${YELLOW}💡 Se ainda estiver com erro 502, tente:${NC}"
    echo "   sudo systemctl reload nginx"
    echo "   ou"
    echo "   sudo systemctl restart nginx"
else
    echo -e "${RED}❌ Backend não está funcionando corretamente${NC}"
    echo -e "${YELLOW}💡 Tente:${NC}"
    echo "   pm2 restart projeto-pay-umbrela-backend"
    echo "   pm2 logs projeto-pay-umbrela-backend --lines 50"
fi
echo ""

