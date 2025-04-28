#!/bin/bash

# Definir o IP do servidor para acesso remoto
REMOTE_IP="192.168.1.2"   # ajuste para seu IP real

# Inicializar o LXD se ainda não estiver inicializado
echo "[INFO] Verificando se o LXD já está inicializado..."
if ! lxc info >/dev/null 2>&1; then
    echo "[INFO] Inicializando LXD com configuração básica (modo automático)..."
    lxd init --auto
else
    echo "[INFO] LXD já está inicializado."
fi

# Permitir conexões remotas via HTTPS (TLS)
echo "[INFO] Permitindo conexões remotas no LXD..."
lxc config set core.https_address "[::]:8443"

# Confirmar que a configuração foi aplicada
CURRENT_HTTPS_ADDRESS=$(lxc config get core.https_address)
if [[ "$CURRENT_HTTPS_ADDRESS" == "[::]:8443" ]]; then
    echo "[INFO] HTTPS remoto habilitado com sucesso em [::]:8443"
else
    echo "[ERROR] Falha ao habilitar HTTPS remoto no LXD."
    exit 1
fi

# Explicação para o usuário
echo
echo "[INFO] Configuração inicial concluída."
echo
echo "[INSTRUÇÕES] Para conectar remotamente a este servidor:"
echo "1. No cliente, adicione este servidor com:"
echo ""
echo "   lxc remote add <nome> https://$REMOTE_IP:8443 --accept-certificate"
echo ""
echo "2. O LXD usará autenticação mútua via certificados TLS."
echo
echo "[INFO] Nenhuma senha (trust_password) será usada. A confiança é estabelecida com certificados automaticamente."
