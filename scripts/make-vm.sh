#!/bin/bash

# Default values
MEMORY="2G"
IMAGE=""
USERDATA=""
GRAPHIC=0
STORAGE_SIZE="10G"  # Tamanho do novo disco de armazenamento
PERSISTENT=0        # Variável para habilitar persistência
VM_NAME="vm"       # Nome padrão da VM
OUTPUT_DIR="."     # Diretório de saída padrão
VCPUS="1"         # Número padrão de vCPUs

usage() {
  echo "Usage: $0 [options]"
  echo "Options:"
  echo "  -m, --memory SIZE    Set memory size (default: 2G)"
  echo "  -i, --image FILE     Set disk image file (default: debian-11-generic-amd64-daily.qcow2)"
  echo "  -u, --userdata FILE  Set user data ISO file (default: user-data.iso)"
  echo "  -g, --graphic        Enable graphical mode"
  echo "  -s, --storage SIZE   Set storage disk size (default: 10G)"
  echo "  -p, --persistent     Enable persistent storage (default: disabled)"
  echo "  -n, --name NAME      Set VM name (default: vm)"
  echo "  -o, --output DIR     Set output directory (default: current directory)"
  echo "  -c, --cpus NUM       Set number of vCPUs (default: 1)"
  echo "  -h, --help           Show this help message"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
      -m|--memory)
          MEMORY="$2"
          shift 2
          ;;
      -i|--image)
          IMAGE="$(realpath "$2")"
          shift 2
          ;;
      -u|--userdata)
          USERDATA="$(realpath "$2")"
          shift 2
          ;;
      -g|--graphic)
          GRAPHIC=1
          shift
          ;;
      -s|--storage)
          STORAGE_SIZE="$2"
          shift 2
          ;;
      -p|--persistent)
          PERSISTENT=1
          shift
          ;;
      -n|--name)
          VM_NAME="$2"
          shift 2
          ;;
      -o|--output)
          OUTPUT_DIR="$(realpath "$2")"
          shift 2
          ;;
      -c|--cpus)
          VCPUS="$2"
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

# Check if required files exist
if [ ! -f "$IMAGE" ]; then
  echo "Error: Image file '$IMAGE' not found"
  exit 1
fi

if [ ! -f "$USERDATA" ]; then
  echo "Error: User data file '$USERDATA' not found"
  exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Create VM image copy
VM_IMAGE="${OUTPUT_DIR}/${VM_NAME}.qcow2"
qemu-img create -f qcow2 -b "$IMAGE" "$VM_IMAGE"

# Verify if VM image was created
if [ ! -f "$VM_IMAGE" ]; then
  echo "Error: Failed to create VM image at '$VM_IMAGE'"
  exit 1
fi

# Create storage disk
STORAGE_DISK="${OUTPUT_DIR}/${VM_NAME}_storage.qcow2"
qemu-img create -f qcow2 "$STORAGE_DISK" "$STORAGE_SIZE"

# Verify if storage disk was created
if [ ! -f "$STORAGE_DISK" ]; then
  echo "Error: Failed to create storage disk at '$STORAGE_DISK'"
  exit 1
fi

echo "VM image created at: $VM_IMAGE"
echo "Storage disk created at: $STORAGE_DISK"
