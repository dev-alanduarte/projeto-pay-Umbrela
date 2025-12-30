#!/bin/bash
# Script para atualizar a VPS com as últimas alterações do GitHub

echo "🔄 Atualizando projeto na VPS..."
echo ""

# Navegar para o diretório do projeto
cd ~/projeto-pay-Umbrela || exit 1

# Verificar status do git
echo "📋 Status atual do Git:"
git status

echo ""
echo "⬇️  Fazendo pull das alterações do GitHub..."
git pull origin main

if [ $? -eq 0 ]; then
    echo "✅ Pull realizado com sucesso!"
    echo ""
    
    # Instalar dependências se necessário (caso tenha mudanças no package.json)
    echo "📦 Verificando dependências..."
    cd backend && npm install --production && cd ..
    cd frontend && npm install --production && cd ..
    
    echo ""
    echo "🔄 Reiniciando serviços PM2..."
    pm2 restart projeto-pay-umbrela-backend
    pm2 restart projeto-pay-umbrela-frontend
    
    echo ""
    echo "✅ Atualização concluída!"
    echo ""
    echo "📊 Status dos serviços:"
    pm2 status
    
    echo ""
    echo "📝 Logs do backend (últimas 10 linhas):"
    pm2 logs projeto-pay-umbrela-backend --lines 10 --nostream
    
    echo ""
    echo "📝 Logs do frontend (últimas 10 linhas):"
    pm2 logs projeto-pay-umbrela-frontend --lines 10 --nostream
else
    echo "❌ Erro ao fazer pull. Verifique se há conflitos ou problemas de conexão."
    exit 1
fi

