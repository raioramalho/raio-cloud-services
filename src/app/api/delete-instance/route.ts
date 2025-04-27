import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readdirSync, readFileSync } from 'fs';

const execAsync = promisify(exec);

export async function POST(requisicao: NextRequest) {
  try {
    const { id } = await requisicao.json()

    const files = readdirSync('./tmp')
    const jsonFiles = files.filter(file => file.endsWith('.json'))
    
    let vmInfo = null
    let jsonFile = ''
    for (const file of jsonFiles) {
      const content = readFileSync(`./tmp/${file}`, 'utf-8')
      const json = JSON.parse(content)
      if (json.id === id) {
        vmInfo = json
        jsonFile = file
        break
      }
    }

    if (!vmInfo) {
      throw new Error('Virtual machine not found')
    }

      try {
        const { stdout, stderr } = await execAsync(`bash ./scripts/start-vm.sh -k ${vmInfo.pid}`)
      
        if (stderr) {
          throw new Error(stderr)
        }
      } catch (error) {
        // VM already terminated, continue with deletion
      }
    await execAsync(`rm -f ${vmInfo.cidata} ${vmInfo.storage} ${vmInfo.image}`)
    await execAsync(`rm -f ./tmp/${vmInfo.name}.json`)
    await execAsync(`rm -f ./tmp/${jsonFile}`)

    return NextResponse.json(
      {
        status: 'SUCCESS',
        message: 'Virtual machine deleted successfully'
      },
      { status: 200 }
    )
  } catch (erro: any) {
    console.error(`Erro ao processar requisição: ${erro.message}`)
    return NextResponse.json(
      {
        erro: 'Erro ao processar requisição',
        detalhes: erro.message
      },
      { status: 500 }
    )
  }
}