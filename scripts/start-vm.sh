#!/bin/bash

# Default values
MEMORY="2G"
IMAGE=""
STORAGE=""
USERDATA=""
GRAPHIC=0
CPUS="2"

usage() {
  echo "Usage: $0 [options]"
  echo "Options:"
  echo "  -m, --memory SIZE      Set memory size (default: 2G)"
  echo "  -i, --image FILE       Set VM disk image file (default: debian-11-generic-amd64-daily.qcow2)"
  echo "  -s, --storage FILE     Set storage disk file (default: storage.qcow2)"
  echo "  -u, --userdata FILE    Set user data ISO file (default: user-data.iso)"
  echo "  -g, --graphic          Enable graphical mode"
  echo "  -c, --cpus NUMBER      Set number of CPUs (default: 2)"
  echo "  -h, --help             Show this help message"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
      -m|--memory)
          MEMORY="$2"
          shift 2
          ;;
      -i|--image)
          IMAGE="$2"
          shift 2
          ;;
      -s|--storage)
          STORAGE="$2"
          shift 2
          ;;
      -u|--userdata)
          USERDATA="$2"
          shift 2
          ;;
      -g|--graphic)
          GRAPHIC=1
          shift
          ;;
      -c|--cpus)
          CPUS="$2"
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

# Function to start QEMU
start_qemu() {
  local cmd="qemu-system-x86_64"
  cmd+=" -m $MEMORY"
  cmd+=" -smp $CPUS"
  cmd+=" -drive file=$IMAGE,format=qcow2"
  
  if [ -f "$STORAGE" ]; then
    cmd+=" -drive file=$STORAGE,format=qcow2"
  fi

  if [ -f "$USERDATA" ]; then
    cmd+=" -drive file=$USERDATA,format=raw,if=virtio"
  fi

  cmd+=" -net nic -net user,hostfwd=tcp::2222-:22,hostfwd=tcp::8080-:80,hostfwd=tcp::8443-:443"

  if [ $GRAPHIC -eq 0 ]; then
      cmd+=" -nographic"
  fi

  echo "Starting VM..."
  eval "$cmd"
}

# Check if required files exist
if [ ! -f "$IMAGE" ]; then
  echo "Error: VM image file '$IMAGE' not found."
  exit 1
fi

# Start QEMU
start_qemu