import NewInstanceButton from "@/components/ux/new-instance-button";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, Play, Square, PlusCircle } from "lucide-react";import { VirtualInstance } from "./shared/virtual.instances.type";
import LxcService from "./actions/lxc/lxc.service";
import { ContainerInfo } from "./shared/lxc.list.dto";
import ContainerInstances from "@/components/containers";


// Virtual Instances Section com Tabela
const VirtualInstances = () => {
  const vms: VirtualInstance[] = [
    {
      id: "1",
      name: "VM-001",
      baseImage: "Ubuntu 22.04",
      username: "admin",
      status: "Ativo",
      pid: 1234
    },
    {
      id: "2",
      name: "VM-002",
      baseImage: "Windows Server 2022",
      username: "administrator",
      status: "Inativo",
      pid: 5678
    },
    {
      id: "3",
      name: "VM-003",
      baseImage: "Debian 11",
      username: "root",
      status: "Pendente",
      pid: 9012
    }
  ];

  async function deleteVM(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const pid = Number(formData.get('pid'));
    const id = formData.get('id') as string;

    await fetch('http://localhost:3000/api/delete-instance', {     
      method: 'POST',
      body: JSON.stringify({ name, pid, id }),
    });
  }

  async function startVM(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;

    await fetch('http://localhost:3000/api/start-instance', {     
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
  }

  async function stopVM(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;

    await fetch('http://localhost:3000/api/stop-instance', {     
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
            Máquinas Virtuais
          </h1>
          <p className="text-xs md:text-sm lg:text-base text-muted-foreground">
            Lista de máquinas virtuais e seus status
          </p>
        </div>
        <span  className="flex gap-2">
        <Button variant="outline" size="icon">
          <PlusCircle className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
        </span>
      </div>

      <div className="rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="py-3 px-4 text-left font-medium">Nome</th>
                <th className="py-3 px-4 text-left font-medium">Imagem Base</th>
                <th className="py-3 px-4 text-left font-medium">Usuário</th>
                <th className="py-3 px-4 text-left font-medium">PID</th>
                <th className="py-3 px-4 text-left font-medium">Status</th>
                <th className="py-3 px-4 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vms.map((vm, index) => (
                <tr key={index} className="border-t hover:bg-muted/50">
                  <td className="py-3 px-4">{vm.name}</td>
                  <td className="py-3 px-4">{vm.baseImage}</td>
                  <td className="py-3 px-4">{vm.username}</td>
                  <td className="py-3 px-4">{vm.pid}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(vm.status)}`}>
                      {vm.status || 'Pendente'}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <form action={startVM}>
                        <input type="hidden" name="id" value={vm.id} />
                        <Button variant="ghost" size="icon" type="submit" title="Iniciar">
                          <Play className="h-4 w-4 " />
                        </Button>
                      </form>
                      <form action={stopVM}>
                        <input type="hidden" name="id" value={vm.id} />
                        <Button variant="ghost" size="icon" type="submit" title="Parar">
                          <Square className="h-4 w-4 " />
                        </Button>
                      </form>
                      <form action={deleteVM}>
                        <input type="hidden" name="name" value={vm.name} />
                        <input type="hidden" name="pid" value={vm.pid} />
                        <input type="hidden" name="id" value={vm.id} />
                        <Button variant="ghost" size="icon" type="submit" title="Excluir">
                          <Trash2 className="h-4 w-4 " />
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};




// Função para formatar bytes de forma legível
function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

// Função para formatar uptime (tempo ativo)
function formatUptime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}


const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Running':
      return 'bg-green-100 text-green-800';
    case 'Inativo':
      return 'bg-red-100 text-red-800';
    case 'Pendente':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 md:p-8 lg:p-12 bg-background">
      <div className="w-full max-w-7xl space-y-8 rounded-lg border p-4 md:p-6 lg:p-8 shadow-lg">
        <VirtualInstances />
        <ContainerInstances />
      </div>
    </main>
  );
}