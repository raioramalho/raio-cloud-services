#!/bin/bash

set -e

echo "🚀 Iniciando setup do Raio Cloud Services..."

# Atualiza pacotes e instala dependencias
apt update && apt upgrade -y
apt install -y qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils virt-manager net-tools

# Instala NVM e NodeJS
export NVM_DIR="$HOME/.nvm"

if [ ! -d "$NVM_DIR" ]; then
  echo "📦 Instalando NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
else
  echo "✅ NVM já instalado."
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install --lts
nvm use --lts

# Garante o NodeJS instalado
node -v
npm -v

# Configura rede Bridge
echo "🌐 Configurando bridge de rede..."

cat <<EOF > /etc/netplan/01-raio-cloud.yaml
network:
  version: 2
  renderer: networkd

  ethernets:
    eno1:
      dhcp4: no

  bridges:
    br0:
      interfaces: [eno1]
      dhcp4: true
      parameters:
        stp: false
        forward-delay: 0
EOF

# Aplica configuração de rede
netplan apply

# Define e inicia a rede no libvirt
echo "🔧 Criando rede no Libvirt..."

cat <<EOF > /tmp/raio-cloud-bridge.xml
<network>
  <name>raio-cloud-bridge</name>
  <forward mode="bridge"/>
  <bridge name="br0"/>
</network>
EOF

virsh net-define /tmp/raio-cloud-bridge.xml
virsh net-autostart raio-cloud-bridge
virsh net-start raio-cloud-bridge

# Mensagem final
echo "🎉 Setup concluído! Você já pode criar VMs no seu projeto Raio Cloud!"
