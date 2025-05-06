/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import LxcContainersService from '@/actions/lxc/lxc.containers.service';


export async function POST(requisicao: NextRequest) {
    try {
        const { name, image, network } = await requisicao.json();

        const container = await new LxcContainersService().createContainer({ name, image, network });
        return NextResponse.json(
            container,
            { status: 200 }
        )
    }
    catch(erro: any) {
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

export async function GET() {
    try {

        const data = await new LxcContainersService().listContainers();
        return NextResponse.json(
            data,
            { status: 200 }
        )
    } catch(erro: any) {
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

export async function PUT(requisicao: NextRequest) {
    try {
        const {action, name}= await requisicao.json()

        switch (action) {
            case 'stop':
                await new LxcContainersService().stopContainer(name);
                break;
            case 'start':
                await new LxcContainersService().startContainer(name);
            default:
                return NextResponse.json(
                    {
                        erro: 'Ação não reconhecida',
                        detalhes: 'Ação não reconhecida'
                    },
                    { status: 400 }
                )
        }

        return NextResponse.json(
            {
                status: 'SUCCESS',
                message: 'Virtual machine deleted successfully'
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Erro ao executar o comando:', error);
        return NextResponse.json(
            {
                erro: 'Erro ao executar o comando',
                detalhes: error
            },
            { status: 500 }
        )
    }


}

export async function DELETE(requisicao: NextRequest) {
    try {
        const { name } = await requisicao.json()
        await new LxcContainersService().deleteContainer(name);
        return NextResponse.json(
            {
                status: 'SUCCESS',
                message: 'Virtual machine deleted successfully'
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Erro ao executar o comando:', error);
        return NextResponse.json(
            {
                erro: 'Erro ao executar o comando',
                detalhes: error
            },
            { status: 500 }
        )
    }
}