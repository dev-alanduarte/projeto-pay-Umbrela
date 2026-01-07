#!/bin/bash

# Script para atualizar o projeto na VPS
# Execute: bash deploy-vps.sh

echo "🚀 Iniciando atualização na VPS..."

# Ir para o diretório do projeto (ajuste o caminho se necessário)
cd ~/projeto-pay-Umbrela || cd /var/www/projeto-pay-Umbrela || {
    echo "❌ Erro: Diretório do projeto não encontrado"
    exit 1
}

echo "📥 Fazendo pull das alterações do GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Erro ao fazer git pull"
    exit 1
fi

echo "📦 Instalando dependências do backend..."
cd backend
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências do backend"
    exit 1
fi

cd ..

echo "📦 Instalando dependências do frontend..."
cd frontend
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências do frontend"
    exit 1
fi

cd ..

echo "🔄 Reiniciando aplicações PM2..."
pm2 reload all

if [ $? -ne 0 ]; then
    echo "⚠️  PM2 reload falhou, tentando restart..."
    pm2 restart all
fi

echo "✅ Atualização concluída!"
echo "📊 Status do PM2:"
pm2 status
