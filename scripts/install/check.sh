#!/bin/bash

set -e
set -o pipefail

LOG_FILE="/var/log/raio-cloud/setup-$(date '+%Y%m%d-%H%M%S').log"
NETPLAN_CONFIG="/etc/netplan/01-raio-cloud.yaml"
LIBVIRT_BRIDGE="raio-cloud-bridge"

# Funções de log
log_info() { echo -e "\e[34m[$(date '+%Y-%m-%d %H:%M:%S')]\e[0m $*" | tee -a "$LOG_FILE"; }
log_warn() { echo -e "\e[33m[WARN]\e[0m $*" | tee -a "$LOG_FILE"; }
log_error() { echo -e "\e[31m[ERROR]\e[0m $*" | tee -a "$LOG_FILE"; exit 1; }

# Verificar se é root
if [[ $EUID -ne 0 ]]; then
  log_error "Este script precisa ser executado como root."
fi

# Função para aplicar netplan com validação
apply_netplan() {
  log_info "Aplicando configuração de rede (netplan)..."
  if netplan generate --debug 2>&1 | tee -a "$LOG_FILE"; then
    if netplan apply 2>&1 | tee -a "$LOG_FILE"; then
      log_info "Rede configurada com sucesso."
    else
      log_warn "Aplicação de netplan falhou, restaurando backup."
      cp "${NETPLAN_CONFIG}.bak" "$NETPLAN_CONFIG"
      netplan apply
    fi
  else
    log_error "Erro de sintaxe no arquivo de configuração do Netplan."
  fi
}

# Função para definir e iniciar rede no Libvirt
setup_libvirt_bridge() {
  log_info "Definindo bridge no Libvirt..."

  if virsh net-info "$LIBVIRT_BRIDGE" >/dev/null 2>&1; then
    log_warn "Rede Libvirt '$LIBVIRT_BRIDGE' já definida."
  else
    virsh net-define /tmp/${LIBVIRT_BRIDGE}.xml || log_error "Falha ao definir rede Libvirt."
  fi

  virsh net-autostart "$LIBVIRT_BRIDGE"

  if virsh net-info "$LIBVIRT_BRIDGE" | grep -q 'Active:.*yes'; then
    log_warn "Rede Libvirt já está ativa."
  else
    virsh net-start "$LIBVIRT_BRIDGE" || log_warn "Falha ao iniciar a rede Libvirt."
  fi
}

# Função para configurar firewall
setup_firewall() {
  log_info "Configurando firewall UFW..."

  if ! command -v ufw &>/dev/null; then
    log_error "UFW não instalado."
  fi

  # Libera a porta 22 manualmente (caso o perfil OpenSSH não exista)
  ufw allow 22/tcp || log_warn "Não foi possível liberar porta 22 diretamente."

  ufw allow from any to any proto tcp port 80 comment 'Allow HTTP'
  ufw allow from any to any proto tcp port 443 comment 'Allow HTTPS'

  if ufw status | grep -q inactive; then
    ufw --force enable
  fi

  log_info "Firewall configurado."
}

# Execução principal
main() {
  log_info "Iniciando setup..."
  apply_netplan
  setup_libvirt_bridge
  setup_firewall
  log_info "Setup concluído com sucesso."
}

main "$@"
