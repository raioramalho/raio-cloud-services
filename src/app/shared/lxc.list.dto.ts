export interface ContainerInfo {
  name: string;
  description: string;
  status: string;
  status_code: number;
  created_at: string;
  last_used_at: string;
  location: string;
  type: string;
  project: string;
  architecture: string;
  ephemeral: boolean;
  stateful: boolean;
  profiles: string[];
  config: Record<string, string>;
  devices: Record<string, Device>;
  expanded_config: Record<string, string>;
  expanded_devices: {
    [key: string]: Device & { path?: string; pool?: string; size?: string };
  };
  backups: null;
  state: ContainerState;
  snapshots: null;
}

export interface Device {
  type: string;
  network?: string;
}

export interface ContainerState {
  uptime: number;
  status: string;
  status_code: number;
  disk: {
    root: {
      usage: number;
      total: number;
    };
  };
  memory: {
    usage: number;
    usage_peak: number;
    limit: number;
    total: number;
    swap_usage: number;
    swap_usage_peak: number;
  };
  network: {
    [key: string]: NetworkInterface;
  };
  pid: number;
  processes: number;
  cpu: {
    usage: number;
  };
}

export interface NetworkInterface {
  addresses: IPAddress[];
  counters: NetworkCounters;
  hwaddr: string;
  host_name: string;
  mtu: number;
  state: string;
  type: string;
}

export interface IPAddress {
  family: string;
  address: string;
  netmask: string;
  scope: string;
}

export interface NetworkCounters {
  bytes_received: number;
  bytes_sent: number;
  packets_received: number;
  packets_sent: number;
  errors_received: number;
  errors_sent: number;
  packets_dropped_outbound: number;
  packets_dropped_inbound: number;
}
