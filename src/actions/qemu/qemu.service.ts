import { promisify } from "node:util";
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface QemuVmConfig {
  name: string;
  image?: string;
  memory?: string;
  cpus?: number;
  disk?: string;
  diskSize?: string;
  network?: string;
  arch?: string;
  status?: 'running' | 'stopped';
  additionalParams?: string[];
}

export default class QemuService {
  private vmBasePath: string;
  
  constructor(vmBasePath = '/var/lib/qemu/images') {
    this.vmBasePath = vmBasePath;
  }

  /**
   * Lista todas as VMs QEMU
   */
  async listVms(): Promise<any[]> {
    try {
      const execAsync = promisify(exec);
      // Usando virsh para listar as VMs (requer libvirt)
      const { stdout } = await execAsync(`sudo virsh list --all --name`);
      
      // Processa a saída para formar a lista
      const vmNames = stdout.trim().split('\n').filter(name => name.trim() !== '');
      
      // Coleta informações detalhadas para cada VM
      const vms = await Promise.all(vmNames.map(async (name) => {
        return await this.getVm(name);
      }));
      
      return vms.filter(vm => vm !== null);
    } catch (error) {
      console.error('Erro ao listar VMs QEMU:', error);
      throw new Error('Falha ao listar VMs QEMU');
    }
  }

  /**
   * Busca informações detalhadas de uma VM específica
   */
  async getVm(name: string): Promise<any | null> {
    try {
      const execAsync = promisify(exec);
      
      // Verifica se a VM existe
      const { stdout: checkOutput } = await execAsync(`sudo virsh dominfo ${name} 2>/dev/null || echo "not_found"`);
      if (checkOutput.includes('not_found')) {
        return null;
      }
      
      // Obtém informações da VM
      const { stdout: domInfoOutput } = await execAsync(`sudo virsh dominfo ${name}`);
      const { stdout: domStateOutput } = await execAsync(`sudo virsh domstate ${name}`);
      const { stdout: domXmlOutput } = await execAsync(`sudo virsh dumpxml ${name}`);
      
      // Processa as informações básicas
      const info: any = {
        name,
        status: domStateOutput.trim(),
      };
      
      // Extrai informações do dominfo
      domInfoOutput.split('\n').forEach(line => {
        const parts = line.split(':').map(part => part.trim());
        if (parts.length === 2) {
          if (parts[0] === 'CPU(s)') info.cpus = parseInt(parts[1], 10);
          if (parts[0] === 'Max memory') {
            const memParts = parts[1].split(' ');
            info.memory = `${memParts[0]}${memParts[1].toLowerCase()}`;
          }
        }
      });
      
      // Poderia extrair mais informações do XML se necessário
      // (análise básica aqui, para análise completa recomenda-se uma lib XML)
      if (domXmlOutput.includes('<disk')) {
        const diskMatch = /<source file=['"]([^'"]+)['"]/.exec(domXmlOutput);
        if (diskMatch && diskMatch[1]) {
          info.disk = diskMatch[1];
          
          // Obtém o tamanho do disco
          try {
            const { stdout: diskSizeOutput } = await execAsync(`qemu-img info ${diskMatch[1]} | grep 'virtual size'`);
            const sizeMatch = /virtual size: ([0-9.]+) ([KMGTkmgt]iB)/.exec(diskSizeOutput);
            if (sizeMatch) {
              info.diskSize = `${sizeMatch[1]}${sizeMatch[2]}`;
            }
          } catch (e) {
            // Ignora erros na obtenção do tamanho do disco
          }
        }
      }
      
      return info;
    } catch (error) {
      console.error(`Erro ao buscar VM ${name}:`, error);
      return null;
    }
  }

  /**
   * Cria uma nova VM QEMU
   */
  async createVm(config: QemuVmConfig): Promise<boolean> {
    try {
      const execAsync = promisify(exec);
      
      // Configurações padrão
      const vmName = config.name;
      const memory = config.memory || '1G';
      const cpus = config.cpus || 1;
      const arch = config.arch || 'x86_64';
      
      // Garante que o diretório de VMs existe
      await execAsync(`sudo mkdir -p ${this.vmBasePath}`);
      
      // Caminho do disco
      const diskPath = config.disk || path.join(this.vmBasePath, `${vmName}.qcow2`);
      
      // Cria o disco se não foi especificado um existente
      if (!config.disk) {
        const diskSize = config.diskSize || '10G';
        await execAsync(`sudo qemu-img create -f qcow2 ${diskPath} ${diskSize}`);
        await execAsync(`sudo chmod 666 ${diskPath}`);
      }
      
      // Prepara a imagem de instalação
      let installOptions = '';
      if (config.image) {
        installOptions = `-cdrom ${config.image}`;
      }
      
      // Configuração de rede
      const netOptions = config.network || '-net nic -net user,hostfwd=tcp::2222-:22';
      
      // Parâmetros adicionais 
      const additionalParams = config.additionalParams ? config.additionalParams.join(' ') : '';
      
      // Constrói o comando virt-install (interface do libvirt para QEMU)
      const command = `sudo virt-install \
        --name=${vmName} \
        --ram=${memory.replace(/[^0-9]/g, '')} \
        --vcpus=${cpus} \
        --disk path=${diskPath},format=qcow2 \
        --os-variant=generic \
        --network bridge=virbr0 \
        --graphics none \
        --console pty,target_type=serial \
        --import \
        ${installOptions} \
        --noautoconsole`;
      
      // Executa o comando de criação
      await execAsync(command);
      
      // Opcionalmente inicia a VM se configurado
      if (config.status === 'running') {
        await this.startVm(vmName);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao criar VM:', error);
      throw new Error(`Falha ao criar VM: ${error.message}`);
    }
  }

  /**
   * Atualiza as configurações de uma VM existente
   */
  async updateVm(name: string, config: Partial<QemuVmConfig>): Promise<boolean> {
    try {
      const execAsync = promisify(exec);
      
      // Verifica se a VM existe
      const vm = await this.getVm(name);
      if (!vm) {
        throw new Error(`VM ${name} não encontrada`);
      }

      // Atualiza CPU
      if (config.cpus) {
        await execAsync(`sudo virsh setvcpus ${name} ${config.cpus} --config`);
      }
      
      // Atualiza memória (apenas quando a VM está desligada)
      if (config.memory) {
        const memoryInKB = this.convertMemoryToKB(config.memory);
        
        // Verifica se a VM está rodando
        if (vm.status === 'running') {
          // Se estiver rodando, use o valor atual máximo para update em execução
          await execAsync(`sudo virsh setmem ${name} ${memoryInKB} --live`);
        }
        
        // Sempre atualiza a configuração persistente
        await execAsync(`sudo virsh setmaxmem ${name} ${memoryInKB} --config`);
      }
      
      // Atualiza status (iniciar/parar)
      if (config.status === 'running' && vm.status !== 'running') {
        await this.startVm(name);
      } else if (config.status === 'stopped' && vm.status === 'running') {
        await this.stopVm(name);
      }

      return true;
    } catch (error) {
      console.error(`Erro ao atualizar VM ${name}:`, error);
      throw new Error(`Falha ao atualizar VM ${name}: ${error.message}`);
    }
  }

  /**
   * Remove uma VM QEMU
   */
  async deleteVm(name: string, removeDisk = true): Promise<boolean> {
    try {
      const execAsync = promisify(exec);
      
      // Obtém informações da VM antes de remover
      const vm = await this.getVm(name);
      
      // Para a VM se estiver em execução
      if (vm && vm.status === 'running') {
        await this.stopVm(name);
      }
      
      // Remove a VM
      await execAsync(`sudo virsh undefine ${name}`);
      
      // Opcionalmente remove o disco
      if (removeDisk && vm && vm.disk) {
        await execAsync(`sudo rm -f ${vm.disk}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao remover VM ${name}:`, error);
      throw new Error(`Falha ao remover VM ${name}`);
    }
  }
  
  /**
   * Inicia uma VM existente
   */
  async startVm(name: string): Promise<boolean> {
    try {
      const execAsync = promisify(exec);
      await execAsync(`sudo virsh start ${name}`);
      return true;
    } catch (error) {
      console.error(`Erro ao iniciar VM ${name}:`, error);
      throw new Error(`Falha ao iniciar VM ${name}`);
    }
  }
  
  /**
   * Para uma VM em execução
   */
  async stopVm(name: string, force = false): Promise<boolean> {
    try {
      const execAsync = promisify(exec);
      
      if (force) {
        await execAsync(`sudo virsh destroy ${name}`);
      } else {
        await execAsync(`sudo virsh shutdown ${name}`);
        
        // Aguarda até que a VM esteja realmente desligada (com timeout)
        let attempts = 0;
        const maxAttempts = 30; // 30 segundos de timeout
        
        while (attempts < maxAttempts) {
          const { stdout } = await execAsync(`sudo virsh domstate ${name}`);
          if (stdout.trim() === 'shut off') {
            break;
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }
        
        // Se não desligou após o timeout, força
        if (attempts >= maxAttempts) {
          await execAsync(`sudo virsh destroy ${name}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao parar VM ${name}:`, error);
      throw new Error(`Falha ao parar VM ${name}`);
    }
  }
  
  /**
   * Conecta à console da VM
   * Retorna o comando para conexão
   */
  async consoleVm(name: string): Promise<string> {
    try {
      // Verifica se a VM existe
      const vm = await this.getVm(name);
      if (!vm) {
        throw new Error(`VM ${name} não encontrada`);
      }
      
      // Apenas retorna o comando, pois conectar diretamente não funciona bem em ambiente de API
      return `sudo virsh console ${name}`;
    } catch (error) {
      console.error(`Erro ao conectar à console da VM ${name}:`, error);
      throw new Error(`Falha ao conectar à console da VM ${name}`);
    }
  }
  
  /**
   * Obtém o snapshot list de uma VM
   */
  async listSnapshots(name: string): Promise<any[]> {
    try {
      const execAsync = promisify(exec);
      
      // Verifica se a VM existe
      const vm = await this.getVm(name);
      if (!vm) {
        throw new Error(`VM ${name} não encontrada`);
      }
      
      const { stdout } = await execAsync(`sudo virsh snapshot-list ${name} --name`);
      const snapshots = stdout.trim().split('\n').filter(snap => snap.trim() !== '');
      
      // Coleta informações detalhadas para cada snapshot
      const snapshotDetails = await Promise.all(snapshots.map(async (snapName) => {
        const { stdout: snapInfo } = await execAsync(`sudo virsh snapshot-info ${name} ${snapName}`);
        
        // Processa as informações
        const info: any = { name: snapName };
        
        snapInfo.split('\n').forEach(line => {
          const parts = line.split(':').map(part => part.trim());
          if (parts.length === 2) {
            if (parts[0] === 'Creation Time') info.creationTime = parts[1];
            if (parts[0] === 'State') info.state = parts[1];
          }
        });
        
        return info;
      }));
      
      return snapshotDetails;
    } catch (error) {
      console.error(`Erro ao listar snapshots da VM ${name}:`, error);
      throw new Error(`Falha ao listar snapshots da VM ${name}`);
    }
  }
  
  /**
   * Cria um snapshot da VM
   */
  async createSnapshot(name: string, snapName: string, description?: string): Promise<boolean> {
    try {
      const execAsync = promisify(exec);
      
      // Verifica se a VM existe
      const vm = await this.getVm(name);
      if (!vm) {
        throw new Error(`VM ${name} não encontrada`);
      }
      
      // Cria o snapshot
      let command = `sudo virsh snapshot-create-as ${name} ${snapName}`;
      if (description) {
        command += ` --description "${description}"`;
      }
      
      await execAsync(command);
      return true;
    } catch (error) {
      console.error(`Erro ao criar snapshot da VM ${name}:`, error);
      throw new Error(`Falha ao criar snapshot da VM ${name}`);
    }
  }
  
  /**
   * Restaura um snapshot da VM
   */
  async restoreSnapshot(name: string, snapName: string): Promise<boolean> {
    try {
      const execAsync = promisify(exec);
      
      // Verifica se a VM existe
      const vm = await this.getVm(name);
      if (!vm) {
        throw new Error(`VM ${name} não encontrada`);
      }
      
      // Restaura o snapshot
      await execAsync(`sudo virsh snapshot-revert ${name} ${snapName}`);
      return true;
    } catch (error) {
      console.error(`Erro ao restaurar snapshot da VM ${name}:`, error);
      throw new Error(`Falha ao restaurar snapshot da VM ${name}`);
    }
  }
  
  /**
   * Remove um snapshot da VM
   */
  async deleteSnapshot(name: string, snapName: string): Promise<boolean> {
    try {
      const execAsync = promisify(exec);
      
      // Verifica se a VM existe
      const vm = await this.getVm(name);
      if (!vm) {
        throw new Error(`VM ${name} não encontrada`);
      }
      
      // Remove o snapshot
      await execAsync(`sudo virsh snapshot-delete ${name} ${snapName}`);
      return true;
    } catch (error) {
      console.error(`Erro ao remover snapshot da VM ${name}:`, error);
      throw new Error(`Falha ao remover snapshot da VM ${name}`);
    }
  }
  
  /**
   * Utilitário para converter string de memória para KB
   * Ex: '1G' => 1048576
   */
  private convertMemoryToKB(memory: string): number {
    const numericPart = parseFloat(memory.replace(/[^0-9.]/g, ''));
    const unit = memory.replace(/[0-9.]/g, '').toLowerCase();
    
    switch (unit) {
      case 'k':
      case 'kb':
        return Math.floor(numericPart);
      case 'm':
      case 'mb':
        return Math.floor(numericPart * 1024);
      case 'g':
      case 'gb':
        return Math.floor(numericPart * 1024 * 1024);
      case 't':
      case 'tb':
        return Math.floor(numericPart * 1024 * 1024 * 1024);
      default:
        // Assume MB se nenhuma unidade for especificada
        return Math.floor(numericPart * 1024);
    }
  }
}