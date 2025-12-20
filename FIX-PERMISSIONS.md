# 🔧 Correção de Permissões para Nginx

## Problema:
O Nginx roda como usuário `www-data` (ou `nginx`), que não tem permissão para acessar `/root/projeto-pay-Umbrela/frontend`.

## Solução 1: Dar permissão de leitura ao diretório (Recomendado)

```bash
# Dar permissão de leitura ao diretório para todos
sudo chmod -R 755 /root/projeto-pay-Umbrela/frontend

# Dar permissão ao grupo www-data (ou nginx)
sudo chgrp -R www-data /root/projeto-pay-Umbrela/frontend
sudo chmod -R g+r /root/projeto-pay-Umbrela/frontend
```

## Solução 2: Mover para diretório padrão do Nginx

```bash
# Copiar arquivos para diretório padrão
sudo mkdir -p /var/www/pagamentoseguromarketplace.com
sudo cp -r /root/projeto-pay-Umbrela/frontend/* /var/www/pagamentoseguromarketplace.com/
sudo chown -R www-data:www-data /var/www/pagamentoseguromarketplace.com
sudo chmod -R 755 /var/www/pagamentoseguromarketplace.com
```

E atualizar o `nginx-https.conf`:
```nginx
root /var/www/pagamentoseguromarketplace.com;
```

## Solução 3: Usar proxy para o http-server (Mais simples)

Manter o http-server rodando e fazer proxy do Nginx para ele.

