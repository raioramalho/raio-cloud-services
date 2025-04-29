import { promisify } from "node:util";
import { exec } from 'child_process';

export default class LxcService {
  constructor() {}

  /**
   * Lista todos os contêineres LXC
   */
  async listContainers(): Promise<any[]> {
    try {
      const execAsync = promisify(exec);
      const { stdout } = await execAsync(`sudo lxc list --format json`);
      const json: any = JSON.parse(stdout);
      return json;
    } catch (error) {
      console.error('Erro ao listar contêineres:', error);
      throw new Error('Falha ao listar contêineres');
    }
  }

  /**
   * Busca informações detalhadas de um contêiner específico
   */
  async getContainer(name: string): Promise<any | null> {
    try {
      const execAsync = promisify(exec);
      const { stdout } = await execAsync(`sudo lxc info ${name} --format json`);
      return JSON.parse(stdout);
    } catch (error) {
      console.error(`Erro ao buscar contêiner ${name}:`, error);
      return null;
    }
  }

  /**
   * Cria um novo contêiner LXC
   */
  async createContainer(config: any): Promise<boolean> {
    try {
      const execAsync = promisify(exec);
      const imageString = config.image || 'ubuntu:20.04';
      let command = `sudo lxc launch ${imageString} ${config.name}`;
      
      // Adiciona configurações adicionais se fornecidas
      if (config.limits?.cpu) {
        await execAsync(`sudo lxc config set ${config.name} limits.cpu ${config.limits.cpu}`);
      }
      if (config.limits?.memory) {
        await execAsync(`sudo lxc config set ${config.name} limits.memory ${config.limits.memory}`);
      }

      // Executa o comando de criação
      await execAsync(command);
      return true;
    } catch (error) {
      console.error('Erro ao criar contêiner:', error);
      throw new Error('Falha ao criar contêiner');
    }
  }

  /**
   * Atualiza as configurações de um contêiner existente
   */
  async updateContainer(name: string, config: Partial<any>): Promise<boolean> {
    try {
      const execAsync = promisify(exec);
      
      // Verifica se o contêiner existe
      const container = await this.getContainer(name);
      if (!container) {
        throw new Error(`Contêiner ${name} não encontrado`);
      }

      // Atualiza configurações
      if (config.limits?.cpu) {
        await execAsync(`sudo lxc config set ${name} limits.cpu ${config.limits.cpu}`);
      }
      if (config.limits?.memory) {
        await execAsync(`sudo lxc config set ${name} limits.memory ${config.limits.memory}`);
      }
      
      // Atualiza status (iniciar/parar)
      if (config.status === 'running' && container.status !== 'Running') {
        await execAsync(`sudo lxc start ${name}`);
      } else if (config.status === 'stopped' && container.status === 'Running') {
        await execAsync(`sudo lxc stop ${name}`);
      }

      return true;
    } catch (error) {
      console.error(`Erro ao atualizar contêiner ${name}:`, error);
      throw new Error(`Falha ao atualizar contêiner ${name}`);
    }
  }

  /**
   * Remove um contêiner LXC
   */
  async deleteContainer(name: string): Promise<boolean> {
    try {
      const execAsync = promisify(exec);
      await execAsync(`sudo lxc delete ${name} --force`);
      return true;
    } catch (error) {
      console.error(`Erro ao remover contêiner ${name}:`, error);
      throw new Error(`Falha ao remover contêiner ${name}`);
    }
  }
  
  /**
   * Inicia um contêiner existente
   */
  async startContainer(name: string): Promise<boolean> {
    try {
      const execAsync = promisify(exec);
      await execAsync(`sudo lxc start ${name}`);
      return true;
    } catch (error) {
      console.error(`Erro ao iniciar contêiner ${name}:`, error);
      throw new Error(`Falha ao iniciar contêiner ${name}`);
    }
  }
  
  /**
   * Para um contêiner em execução
   */
  async stopContainer(name: string): Promise<boolean> {
    try {
      const execAsync = promisify(exec);
      await execAsync(`sudo lxc stop ${name}`);
      return true;
    } catch (error) {
      console.error(`Erro ao parar contêiner ${name}:`, error);
      throw new Error(`Falha ao parar contêiner ${name}`);
    }
  }
}