#!/bin/bash

while true; do
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Checking PIDs from .tmp/*.json files..."
    
    # Check if .tmp directory exists
    if [ -d "./tmp" ]; then
        # Find all JSON files and extract PIDs
        for file in ./tmp/*.json; do
            if [ -f "$file" ]; then
                pid=$(jq -r '.pid' "$file")
                name=$(jq -r '.name' "$file")
                status=$(jq -r '.status' "$file")
                current_time=$(date '+%Y-%m-%d %H:%M:%S')
                
                if [ "$pid" != "0" ] && ps -p $pid > /dev/null; then
                    if [ "$status" != "Ativo" ]; then
                        echo "$(date '+%Y-%m-%d %H:%M:%S') - VM: $name - PID: $pid - Status: Updating to Ativo"
                        # Update status to "Ativo" in the JSON file
                        jq --arg time "$current_time" '.status = "Ativo" | .last_update = $time' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
                    fi
                else
                    echo "$(date '+%Y-%m-%d %H:%M:%S') - VM: $name - PID: $pid - Status: Updating to Inativo"
                    # Update status to "Inativo" in the JSON file
                    jq --arg time "$current_time" '.status = "Inativo" | .last_update = $time' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
                fi
            fi
        done
    else
        echo "$(date '+%Y-%m-%d %H:%M:%S') - Directory ./tmp not found"
    fi
    
    # Wait 10 seconds before next check
    sleep 10
done