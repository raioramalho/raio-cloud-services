#!/bin/bash

set -euo pipefail
IFS=$'\n\t'

# Default values
USERDATA_FILE="user-data"
METADATA_FILE="meta-data"
ISO_OUTPUT="user-data.iso"
CIDATA_DIR="cidata"
USERNAME="root"
SSH_KEY=""
SSH_KEY_STRING=""

usage() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  -u, --userdata FILE      Set user-data file (default: user-data)"
    echo "  -m, --metadata FILE      Set meta-data file (optional, default: meta-data)"
    echo "  -o, --output FILE        Set output ISO file name (default: user-data.iso)"
    echo "  --username NAME          Set username (default: root)"
    echo "  --ssh-key PATH           Set SSH public key file (optional)"
    echo "  --ssh-key-string KEY     Set SSH public key directly as string (optional)"
    echo "  -h, --help               Show this help message"
}

cleanup() {
    rm -rf "$CIDATA_DIR"
}

trap cleanup EXIT

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -u|--userdata)
                USERDATA_FILE="$2"
                shift 2
                ;;
            -m|--metadata)
                METADATA_FILE="$2"
                shift 2
                ;;
            -o|--output)
                ISO_OUTPUT="$2"
                shift 2
                ;;
            --username)
                USERNAME="$2"
                shift 2
                ;;
            --ssh-key)
                SSH_KEY="$2"
                shift 2
                ;;
            --ssh-key-string)
                SSH_KEY_STRING="$2"
                shift 2
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
}

generate_user_data() {
    echo "🔧 Gerando 'user-data' dinâmico..."

    mkdir -p "$CIDATA_DIR"

    {
        echo "#cloud-config"
        echo "users:"
        echo "  - name: $USERNAME"
        echo "    lock_passwd: false"
        echo "    shell: /bin/bash"
        echo "    sudo: ALL=(ALL) NOPASSWD:ALL"
        echo "    ssh_authorized_keys:"
        if [[ -n "$SSH_KEY" && -f "$SSH_KEY" ]]; then
            while read -r line; do
                echo "      - $line"
            done < "$SSH_KEY"
        fi
        if [[ -n "$SSH_KEY_STRING" ]]; then
            echo "      - $SSH_KEY_STRING"
        fi
        echo "ssh_pwauth: true"
        echo "disable_root: false"
        echo "runcmd:"
        echo "  - sed -i 's/^#\\?PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config"
        echo "  - sed -i 's/^#\\?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config"
        echo "  - echo \"AllowUsers root deploy\" >> /etc/ssh/sshd_config"
        echo "  - systemctl restart sshd"
        # Aqui começa o setup do disco extra
        echo "  - parted /dev/sdb mklabel gpt --script"
        echo "  - parted /dev/sdb mkpart primary ext4 0% 100% --script"
        echo "  - mkfs.ext4 -F /dev/sdb1"
        echo "  - mkdir -p /mnt/storage"
        echo "  - UUID=\$(blkid -s UUID -o value /dev/sdb1)"
        echo "  - echo \"\$UUID /mnt/storage ext4 defaults 0 2\" >> /etc/fstab"
        echo "  - mount -a"
        echo "  - chown root:root /mnt/storage"
        echo "  - chmod 755 /mnt/storage"
    } > "$CIDATA_DIR/user-data"
}

build_iso() {
    echo "🗑️  Removendo ISO antiga ($ISO_OUTPUT)..."
    rm -f "$ISO_OUTPUT"

    echo "📁 Criando diretório temporário '$CIDATA_DIR'..."
    mkdir -p "$CIDATA_DIR"

    if [ -f "$USERDATA_FILE" ]; then
        echo "📝 Copiando '$USERDATA_FILE' para '$CIDATA_DIR'..."
        cp "$USERDATA_FILE" "$CIDATA_DIR/user-data"
    else
        echo "🛠️  Arquivo 'user-data' não encontrado. Gerando automático..."
        generate_user_data
    fi

    if [ -f "$METADATA_FILE" ]; then
        echo "📝 Copiando '$METADATA_FILE' para '$CIDATA_DIR'..."
        cp "$METADATA_FILE" "$CIDATA_DIR/meta-data"
    else
        echo "⚠️  meta-data não encontrado. Criando vazio..."
        echo "" > "$CIDATA_DIR/meta-data"
    fi

    echo "💿 Gerando ISO '$ISO_OUTPUT'..."
    genisoimage -o "$ISO_OUTPUT" -R -J -V cidata "$CIDATA_DIR"

    echo "✅ ISO criada com sucesso: $ISO_OUTPUT"
}

main() {
    parse_args "$@"
    build_iso
}

main "$@"
