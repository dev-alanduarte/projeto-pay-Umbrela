#!/bin/bash

# Script para corrigir o erro de optional chaining no server.js
# Execute na VPS: bash corrigir-server-vps.sh

echo "🔧 Corrigindo erro de optional chaining no server.js..."

FILE="backend/src/server.js"

if [ ! -f "$FILE" ]; then
    echo "❌ Arquivo $FILE não encontrado!"
    exit 1
fi

# Fazer backup
cp "$FILE" "${FILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Corrigir a linha com optional chaining
# Procura por: position: err.message.match(/position (\d+)/)?.[1] || 'desconhecido',
# Substitui por código compatível

sed -i "s/position: err\.message\.match(\/position (\\\d\+)\/)?\.\[1\] || 'desconhecido',/position: (function() { const match = err.message.match(\/position (\\\d\+)\/); return match ? match[1] : 'desconhecido'; })(),/g" "$FILE"

# Verificar se foi corrigido
if grep -q "?\.\[1\]" "$FILE"; then
    echo "❌ Ainda há optional chaining no arquivo!"
    echo "Tentando método alternativo..."
    
    # Método alternativo: substituir linha por linha
    sed -i '47s/.*/      position: (function() { const match = err.message.match(\/position (\\\d\+)\/); return match ? match[1] : '\''desconhecido'\''; })(),/' "$FILE"
fi

# Verificar resultado
if grep -q "?\.\[1\]" "$FILE"; then
    echo "❌ Erro: Não foi possível corrigir automaticamente"
    echo "Por favor, edite manualmente a linha 47 do arquivo $FILE"
    exit 1
else
    echo "✅ Arquivo corrigido com sucesso!"
    echo ""
    echo "Linha corrigida:"
    grep -n "position:" "$FILE" | head -1
    echo ""
    echo "💡 Agora execute: pm2 restart projeto-pay-umbrela-backend"
fi

