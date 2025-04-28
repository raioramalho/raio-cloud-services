#!/bin/bash
set -euo pipefail

# ========== CONFIG ==========

LOGDIR="/var/log/raio-cloud"
LOGFILE="$LOGDIR/setup-$(date '+%Y%m%d-%H%M%S').log"
PROJECT_NAME="raio-cloud"
NVM_VERSION="v0.39.7"
TRUST_PASSWORD="raio-cloud-admin"
BRIDGE_NAME="br0"
LIBVIRT_NET_NAME="raio-cloud-bridge"

# ========== UTILS ==========

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1" >&2; exit 1; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

trap 'error "Erro na linha $LINENO, veja $LOGFILE"' ERR

# ========== ROOT CHECK ==========

[ "$(id -u)" -eq 0 ] || error "Este script precisa ser executado como root."

# ========== USER DETECTION ==========

CURRENT_USER=${SUDO_USER:-$(whoami)}
HOME_DIR=$(eval echo "~$CURRENT_USER")

# ========== LOG SETUP ==========

mkdir -p "$LOGDIR"
chown root:root "$LOGDIR"
exec > >(tee -a "$LOGFILE") 2>&1

# ========== SYSTEM PREP ==========

log "Atualizando pacotes..."
export DEBIAN_FRONTEND=noninteractive
apt update && apt upgrade -y

REQUIRED_PKGS=(qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils virt-manager net-tools ufw curl wget git snapd)
log "Instalando dependências: ${REQUIRED_PKGS[*]}"

apt install -y "${REQUIRED_PKGS[@]}"

# ========== LXD SETUP ==========

if ! command -v lxd &> /dev/null; then
    log "Instalando LXD via snap..."
    systemctl is-active snapd || systemctl start snapd
    snap install lxd
fi
log "LXD disponível."

if ! lxc network show "$BRIDGE_NAME" &>/dev/null; then
    log "Inicializando LXD..."
    cat <<EOF | lxd init --preseed
config:
  core.https_address: 127.0.0.1:8443
  core.trust_password: $TRUST_PASSWORD
networks:
- name: $BRIDGE_NAME
  type: bridge
  config:
    ipv4.address: auto
    ipv6.address: auto
storage_pools:
- name: default
  driver: zfs
  config:
    size: 20GB
profiles:
- name: default
  devices:
    eth0:
      type: nic
      network: $BRIDGE_NAME
      name: eth0
    root:
      type: disk
      path: /
      pool: default
EOF
else
    log "LXD já configurado."
fi

# ========== NETWORK SETUP ==========

PRIMARY_IFACE=$(ip route get 8.8.8.8 | awk -- '{print $5; exit}')
[ -n "$PRIMARY_IFACE" ] || error "Interface de rede não detectada."

log "Configurando Netplan para interface $PRIMARY_IFACE..."

BACKUP_PATH="/etc/netplan/01-raio-cloud.yaml.bak"
CONFIG_PATH="/etc/netplan/01-raio-cloud.yaml"

[ -f "$CONFIG_PATH" ] && cp "$CONFIG_PATH" "$BACKUP_PATH"

cat <<EOF > "$CONFIG_PATH"
network:
  version: 2
  renderer: networkd
  ethernets:
    $PRIMARY_IFACE:
      dhcp4: no
  bridges:
    $BRIDGE_NAME:
      interfaces: [$PRIMARY_IFACE]
      dhcp4: true
      nameservers:
        addresses: [1.1.1.1, 8.8.8.8]
      parameters:
        stp: false
        forward-delay: 0
EOF

if ! netplan try --timeout 60; then
    warn "Aplicação de netplan falhou, restaurando backup."
    [ -f "$BACKUP_PATH" ] && cp "$BACKUP_PATH" "$CONFIG_PATH"
    netplan apply || error "Falha ao restaurar rede após restauração."
fi

netplan apply
log "Rede configurada com sucesso."

# ========== LIBVIRT BRIDGE ==========

log "Definindo bridge no Libvirt..."

cat <<EOF > /tmp/${LIBVIRT_NET_NAME}.xml
<network>
  <name>${LIBVIRT_NET_NAME}</name>
  <forward mode="bridge"/>
  <bridge name="${BRIDGE_NAME}"/>
</network>
EOF

virsh net-define /tmp/${LIBVIRT_NET_NAME}.xml || warn "Rede Libvirt já definida."
virsh net-autostart "${LIBVIRT_NET_NAME}" || warn "Falha no autostart da rede Libvirt."
virsh net-start "${LIBVIRT_NET_NAME}" || warn "Falha ao iniciar a rede Libvirt."

# ========== FIREWALL ==========

log "Configurando firewall UFW..."

ufw allow OpenSSH
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8443/tcp
ufw allow 3000/tcp

ufw --force enable

# ========== NODE.JS / NVM SETUP ==========

log "Instalando NVM para $CURRENT_USER..."

if [ ! -d "$HOME_DIR/.nvm" ]; then
    su - "$CURRENT_USER" -c "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh | bash"
fi

# Garante que NVM está configurado nos arquivos do usuário
for f in "$HOME_DIR/.bashrc" "$HOME_DIR/.profile"; do
    if ! grep -q 'NVM_DIR' "$f"; then
      cat <<EOF >> "$f"

# NVM Configuration
export NVM_DIR="\$HOME/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
[ -s "\$NVM_DIR/bash_completion" ] && \. "\$NVM_DIR/bash_completion"
EOF
    fi
done

# Instala Node.js + pacotes globais
log "Instalando Node.js + pacotes globais para $CURRENT_USER..."

su - "$CURRENT_USER" <<'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install --lts
nvm use --lts
nvm alias default node
npm install -g typescript ts-node nodemon yarn
EOF

# ========== NEXT.JS PROJECT SETUP ==========

PROJECT_DIR="$HOME_DIR/$PROJECT_NAME"

if [ ! -d "$PROJECT_DIR" ]; then
    log "Criando projeto Next.js em $PROJECT_DIR"
    mkdir -p "$PROJECT_DIR"
    chown -R "$CURRENT_USER":"$CURRENT_USER" "$PROJECT_DIR"

    su - "$CURRENT_USER" <<EOF
cd "$PROJECT_DIR"
npx create-next-app@latest . --typescript --eslint --tailwind --app --src-dir --import-alias '@/*'
npm install express mongoose dotenv cors helmet jsonwebtoken
EOF
else
    log "Projeto já existe em $PROJECT_DIR"
fi

success "Setup completo!"
