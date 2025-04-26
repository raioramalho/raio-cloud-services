import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, writeFile as writeFileCallback } from 'fs';
import { promisify as utilPromisify } from 'util';

const execAsync = promisify(exec);
const writeFile = utilPromisify(writeFileCallback);

export type CreateVirtualMachineDto = {
  name: string
  size: {
    cpu: number
    memory: string
  }
  diskSize: string
  image: string
  sshKey: string
  userName: string
}

export type VirtualMachineSettings = {
  cpu: number
  memory: string
  cidata: string
  storage: string
  image: string
}


async function createCidata(name: string, userName: string, sshKey: string): Promise<{ path: string, output: string }> {
  const cidata = `${name}_user-data.iso`;
  const cidataPath = `./tmp/${cidata}`;

  const { stdout, stderr } = await execAsync(`bash ./scripts/make-cidata.sh --username ${userName} --ssh-key-string "${sshKey}" -o ${cidataPath}`);

  if (stderr && !existsSync(cidataPath)) {
    throw new Error(stderr);
  }

  return { path: cidataPath, output: stdout };
}

async function selectImage(image: string, name: string) {
  const vmPath = `./tmp/${name}.qcow2`;
  const { stdout, stderr } = await execAsync(`cp ./public/images/${image} ./tmp/${name}.qcow2`);
  if (stderr && !existsSync(vmPath)) {
    throw new Error(stderr);
  }

  return { path: vmPath, output: stdout };
}

async function createVirtualMachine(dto: CreateVirtualMachineDto, cidataPath: string, imagePath: string) {
  const vmPath = `./tmp/${dto.name}.qcow2`;

  const { stdout, stderr } = await execAsync(`bash ./scripts/make-vm.sh -c ${dto.size.cpu} -m ${dto.size.memory} -s ${dto.diskSize}G -i ./tmp/${dto.name}.qcow2 -n ${dto.name} -u ${cidataPath} -o ./tmp/`);

  if (stderr && !existsSync(vmPath)) {
    throw new Error(stderr);
  }

  return { path: vmPath, output: stdout };
}

async function startVirtualMachine(vmSettings: VirtualMachineSettings) {
  const { stdout, stderr } = await execAsync(`bash ./scripts/start-vm.sh -c ${vmSettings.cpu} -m ${vmSettings.memory} -i ${vmSettings.image} -s ${vmSettings.storage} -u ${vmSettings.cidata} -g`);

  if (stderr) {
    throw new Error(stderr);
  }

  return { output: stdout };
}

export async function POST(requisicao: NextRequest) {
  try {
    const body: CreateVirtualMachineDto = await requisicao.json();
    const cidata = await createCidata(body.name, body.userName, body.sshKey);
    const image = await selectImage(body.image, body.name);
    const vm = await createVirtualMachine(body, cidata.path, image.path);


    const vmSettings: VirtualMachineSettings = {
      cpu: body.size.cpu,
      memory: body.size.memory,
      cidata: cidata.path,
      storage: './tmp/' + body.name + '_storage.qcow2',
      image: vm.path
    }
    await writeFile(`./tmp/${body.name}_settings.json`, JSON.stringify(vmSettings, null, 2))

    const start = await startVirtualMachine(vmSettings);

    return NextResponse.json(
      {
        status: 'PENDING',
        ...vmSettings
      },
      { status: 200 }
    );
  } catch (erro: any) {
    console.error(`Erro ao processar requisição: ${erro.message}`);
    return NextResponse.json(
      {
        erro: 'Erro ao processar requisição',
        detalhes: erro.message
      },
      { status: 500 }
    );
  }
}