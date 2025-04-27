#!/bin/bash

# Get the current directory
DIR="$(dirname "${BASH_SOURCE[0]}")"
JSON_FILE="$DIR/../tmp/*.json"

while true; do
    # Get VM status from start-vm.sh
    VM_STATUS=$("$DIR/start-vm.sh" -l)
    
    # Extract PID from VM status output
    PID=$(echo "$VM_STATUS" | grep -o "PID: [0-9]*" | cut -d' ' -f2)

    # Check if PID is not empty and process is running
    if [ ! -z "$PID" ] && ps -p $PID > /dev/null 2>&1; then
        # Check if port 2222 is open
        if netstat -tuln | grep -q ":2222 "; then
            # Update status to "Ativo" in new JSON
            echo "$(jq '.status = "Ativo"' "$JSON_FILE")"
            echo "Status: Ativo - PID: $PID"
        fi
    else
        echo "Status: Inativo - PID não encontrado"
    fi
    
    sleep 5
done