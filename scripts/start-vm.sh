#!/bin/bash
# Default values
MEMORY="2G"
IMAGE=""
STORAGE=""
USERDATA=""
GRAPHIC=0
CPUS="2"
DAEMON=0
NAME="qemu-vm"
PIDFILE="/tmp/qemu-${NAME}.pid"
JSON_OUTPUT=0
# Detect OS for platform-specific adjustments
OS_TYPE="$(uname -s)"

usage() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo " -m, --memory SIZE   Set memory size (default: 2G)"
    echo " -i, --image FILE    Set VM disk image file"
    echo " -s, --storage FILE  Set storage disk file (default: storage.qcow2)"
    echo " -u, --userdata FILE Set user data ISO file (default: user-data.iso)"
    echo " -g, --graphic       Enable graphical mode"
    echo " -c, --cpus NUMBER   Set number of CPUs (default: 2)"
    echo " -d, --daemon        Run in background (daemon mode)"
    echo " -n, --name NAME     Set VM name (default: qemu-vm)"
    echo " -l, --list         List all running VMs"
    echo " --json           Output in JSON format (use with --list)"
    echo " -k, --kill          Kill running daemon VM"
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
        -d|--daemon)
            DAEMON=1
            shift
            ;;
        -n|--name)
            NAME="$2"
            PIDFILE="/tmp/qemu-${NAME}.pid"
            shift 2
            ;;
        -k|--kill)
            if [ -f "$PIDFILE" ]; then
                echo "Stopping VM $NAME..."
                kill $(cat $PIDFILE)
                rm -f $PIDFILE
                echo "VM stopped."
                exit 0
            else
                echo "No running VM found with name $NAME"
                exit 1
            fi
            ;;
        --json)
            JSON_OUTPUT=1
            shift
            ;;
        -l|--list)
            if [ $JSON_OUTPUT -eq 1 ]; then
                # Prepare JSON output
                echo -n '{"vms": ['
                first_vm=true
                
                # Function to parse port forwards into JSON array
                parse_ports_json() {
                    local ports="$1"
                    local result=""
                    local first=true
                    
                    for port in $(echo "$ports" | grep -o 'hostfwd=[^,[:space:]]*'); do
                        if [ "$first" = true ]; then
                            first=false
                        else
                            result+=", "
                        fi
                        # Extract protocol, host port and guest port
                        local proto=$(echo "$port" | cut -d':' -f1 | cut -d'=' -f2)
                        local host_port=$(echo "$port" | cut -d':' -f3)
                        local guest_port=$(echo "$port" | cut -d':' -f4)
                        result+="\"$proto:$host_port->$guest_port\""
                    done
                    
                    echo "[$result]"
                }
                
                # Process running VMs
                ps aux | grep qemu-system | grep -v grep | while read -r line; do
                    if [ "$first_vm" = true ]; then
                        first_vm=false
                    else
                        echo -n ", "
                    fi
                    
                    pid=$(echo "$line" | awk '{print $2}')
                    vm_name=$(echo "$line" | grep -o '\-name [^ ]*' | cut -d' ' -f2)
                    if [ -z "$vm_name" ]; then vm_name="unknown"; fi
                    
                    # Extract memory, cpus and image file information
                    memory=$(echo "$line" | grep -o '\-m [^ ]*' | cut -d' ' -f2)
                    cpus=$(echo "$line" | grep -o '\-smp [^ ]*' | cut -d' ' -f2)
                    image=$(echo "$line" | grep -o 'file=[^,]*' | head -1 | cut -d'=' -f2)
                    
                    # Parse port forwards
                    ports=$(echo "$line" | grep -o 'hostfwd=[^,[:space:]]*')
                    port_json=$(parse_ports_json "$ports")
                    
                    # Output VM as JSON object
                    echo -n "{"
                    echo -n "\"name\":\"$vm_name\", "
                    echo -n "\"pid\":$pid, "
                    echo -n "\"memory\":\"$memory\", "
                    echo -n "\"cpus\":\"$cpus\", "
                    echo -n "\"image\":\"$image\", "
                    echo -n "\"port_forwards\":$port_json"
                    echo -n "}"
                done
                
                # Close VMs array and start PID files array
                echo -n '], "pid_files": ['
                
                # Process PID files
                first_pid=true
                pid_files=$(ls /tmp/qemu-*.pid 2>/dev/null || echo "")
                for pidfile in $pid_files; do
                    if [ -f "$pidfile" ]; then
                        if [ "$first_pid" = true ]; then
                            first_pid=false
                        else
                            echo -n ", "
                        fi
                        
                        pid=$(cat "$pidfile")
                        name=$(basename "$pidfile" | sed 's/qemu-//;s/\.pid//')
                        
                        echo -n "{"
                        echo -n "\"file\":\"$pidfile\", "
                        echo -n "\"name\":\"$name\", "
                        echo -n "\"pid\":$pid"
                        echo -n "}"
                    fi
                done
                
                # Close JSON object
                echo ']}'
            else
                # Standard text output
                echo "Listing running QEMU VMs:"
                echo "-------------------------"
                if [ "$OS_TYPE" = "Darwin" ]; then
                    # macOS approach
                    ps aux | grep qemu-system | grep -v grep | while read -r line; do
                        pid=$(echo "$line" | awk '{print $2}')
                        vm_name=$(echo "$line" | grep -o '\-name [^ ]*' | cut -d' ' -f2)
                        if [ -z "$vm_name" ]; then vm_name="unknown"; fi
                        echo "VM: $vm_name (PID: $pid)"
                        # Extract port forwards
                        ports=$(echo "$line" | grep -o 'hostfwd=[^,]*' | tr '\n' ' ')
                        if [ -n "$ports" ]; then
                            echo "  Port forwards: $ports"
                        fi
                        echo ""
                    done
                else
                    # Linux approach - more detailed using virsh if available
                    if command -v virsh &> /dev/null; then
                        virsh list --all
                    else
                        ps aux | grep qemu-system | grep -v grep | while read -r line; do
                            pid=$(echo "$line" | awk '{print $2}')
                            vm_name=$(echo "$line" | grep -o '\-name [^ ]*' | cut -d' ' -f2)
                            if [ -z "$vm_name" ]; then vm_name="unknown"; fi
                            echo "VM: $vm_name (PID: $pid)"
                            # Extract port forwards
                            ports=$(echo "$line" | grep -o 'hostfwd=[^,]*' | tr '\n' ' ')
                            if [ -n "$ports" ]; then
                                echo "  Port forwards: $ports"
                            fi
                            echo ""
                        done
                    fi
                fi
                
                # Check for pidfiles in /tmp
                echo "PID files found:"
                echo "---------------"
                ls -l /tmp/qemu-*.pid 2>/dev/null || echo "No PID files found."
            fi
            exit 0
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
    
    if [ -n "$STORAGE" ] && [ -f "$STORAGE" ]; then
        cmd+=" -drive file=$STORAGE,format=qcow2"
    fi
    
    if [ -n "$USERDATA" ] && [ -f "$USERDATA" ]; then
        cmd+=" -drive file=$USERDATA,format=raw,if=virtio"
    fi
    
    cmd+=" -net nic -net user,hostfwd=tcp::2222-:22,hostfwd=tcp::8080-:80,hostfwd=tcp::8443-:443"
    
    if [ $GRAPHIC -eq 0 ]; then
        cmd+=" -nographic"
    fi
    
    # Option to run in daemon mode
    if [ $DAEMON -eq 1 ]; then
        # Add name for easier identification
        cmd+=" -name $NAME"
        
        echo "Starting VM '$NAME' in background..."
        echo "Use '$0 -k -n $NAME' to stop the VM."
        echo "SSH access: ssh -p 2222 user@localhost"
        echo "Web access: http://localhost:8080 or https://localhost:8443"
        
        # Use different approaches based on OS
        if [ "$OS_TYPE" = "Darwin" ]; then
            # macOS approach: use nohup to avoid fork() issues
            nohup $cmd > /tmp/qemu-${NAME}.log 2>&1 &
            PID=$!
            echo $PID > $PIDFILE
            echo "VM started with PID: $PID (logs at /tmp/qemu-${NAME}.log)"
        else
            # Linux approach: use QEMU's native daemonize
            cmd+=" -daemonize -pidfile $PIDFILE"
            eval "$cmd"
        fi
    else
        echo "Starting VM..."
        eval "$cmd"
    fi
}

# Check if required files exist
if [ -z "$IMAGE" ]; then
    echo "Error: VM image file must be specified using -i or --image option."
    exit 1
fi

if [ ! -f "$IMAGE" ]; then
    echo "Error: VM image file '$IMAGE' not found."
    exit 1
fi

# Start QEMU
start_qemu