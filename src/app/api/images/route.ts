import { NextResponse } from 'next/server';
export async function GET() {
  try {
    
    const images = [
        {
          alias: 'ubuntu/22.04',
          description: 'Ubuntu Jammy Jellyfish (22.04 LTS)',
          architecture: 'x86_64',
          created_at: '2023-04-10T12:00:00Z',
          size: 350000000
        },
        {
          alias: 'debian/11',
          description: 'Debian Bullseye (11)',
          architecture: 'x86_64',
          created_at: '2023-03-15T10:30:00Z',
          size: 280000000
        },
        {
          alias: 'alpine/3.17',
          description: 'Alpine 3.17',
          architecture: 'x86_64',
          created_at: '2023-01-20T14:45:00Z',
          size: 120000000
        },
        {
          alias: 'centos/9-stream',
          description: 'CentOS Stream 9',
          architecture: 'x86_64',
          created_at: '2023-02-05T09:15:00Z',
          size: 420000000
        },
        {
          alias: 'fedora/37',
          description: 'Fedora 37',
          architecture: 'x86_64',
          created_at: '2023-03-01T11:20:00Z',
          size: 380000000
        }
      ];
    return NextResponse.json(images, { status: 200 });
  } catch (error) {
    console.error('Erro ao obter imagens:', error);
    return NextResponse.json(
      { error: 'Falha ao obter imagens' },
      { status: 500 }
    );
  }
}