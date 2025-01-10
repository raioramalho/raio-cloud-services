// Funções do servidor
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getProjects } from '@/app/page';

const executarComandoAsync = promisify(exec);

export async function POST(requisicao: NextRequest) {
  try {
    const dados = await requisicao.json();
    const { projetoId } = dados;

    const projects = await getProjects();

    console.log(`ID do projeto recebido: ${projetoId}`);

    if (!projetoId) {
      return NextResponse.json(
        { erro: "ID do projeto e porta são obrigatórios" },
        { status: 400 }
      );
    }

    console.log(`Executando script de implantação para o projeto: ${projetoId}...`);

    const { stdout: saida, stderr: erro } = await executarComandoAsync(
      `sh ./scripts/deploy.sh ${projetoId} ${projects.find(proj => proj.id === projetoId)?.port}`
    );

    if (erro) {
      console.error(`Erro durante a implantação: ${erro}`);
      return NextResponse.json(
        { erro: erro.trim() },
        { status: 500 }
      );
    }

    console.log(`Implantação realizada com sucesso!`);
    return NextResponse.json(
      { mensagem: saida.trim() },
      { status: 200 }
    );
  } catch (erro: any) {
    console.error(`Falha na execução: ${erro.message}`);
    return NextResponse.json(
      {
        erro: 'Falha ao executar script de implantação',
        detalhes: erro.message
      },
      { status: 500 }
    );
  }
}