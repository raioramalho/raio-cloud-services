import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFile as readFileCallback, writeFile as writeFileCallback, readdirSync } from 'fs';
import { promisify as utilPromisify } from 'util';
import { VirtualMachineSettings } from '../types/instance.types';

const execAsync = promisify(exec);
const readFile = utilPromisify(readFileCallback);
const writeFile = utilPromisify(writeFileCallback);

async function startVirtualMachine(vmSettings: VirtualMachineSettings): Promise<{ output: string, pid?: number }> {
  const { stdout, stderr } = await execAsync(`bash ./scripts/start-vm.sh -c ${vmSettings.cpu} -m ${vmSettings.memory} -i ${vmSettings.image} -s ${vmSettings.storage} -u ${vmSettings.cidata} -n ${vmSettings.name} -g -d`);

  if (stderr) {
    throw new Error(stderr);
  }

  const pidMatch = stdout.match(/PID:\s*(\d+)/);
  const pid = pidMatch ? parseInt(pidMatch[1]) : undefined;

  return { output: stdout, pid };
}

export async function POST(requisicao: NextRequest) {
  try {
    const { id } = await requisicao.json();
    const files = readdirSync('./tmp').filter(file => file.endsWith('.json'));
    let vmSettings: VirtualMachineSettings | undefined;
    let filePath: string | undefined;

    for (const file of files) {
      const fileContent = await readFile(`./tmp/${file}`, 'utf8');
      const settings = JSON.parse(fileContent) as VirtualMachineSettings;
      if (settings.id === id) {
        vmSettings = settings;
        filePath = `./tmp/${file}`;
        break;
      }
    }

    if (!vmSettings || !filePath) {
      return NextResponse.json(
        {
          "erro": "Configuração não encontrada",
          "detalhes": "ID não encontrado nos arquivos de configuração"
        },
        { status: 404 }
      );
    }

    const result = await startVirtualMachine(vmSettings);
    
    vmSettings.pid = result.pid || 0;
    vmSettings.status = "Pendente";
    await writeFile(filePath, JSON.stringify(vmSettings, null, 2));
    
    return NextResponse.json(result, { status: 200 });

  } catch (erro: any) {
    console.error(`Erro ao processar requisição: ${erro.message}`);
    return NextResponse.json(
      {
        "erro": "Erro ao processar requisição",
        "detalhes": erro.message
      },
      { status: 500 }
    );
  }
}