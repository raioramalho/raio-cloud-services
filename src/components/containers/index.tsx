'use server';

import { ContainerInfo } from "@/app/shared/lxc.list.dto";
import { Play, RefreshCw, Square, Trash2, PlusCircle, MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { revalidateTag } from "next/cache";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import NewItemIcon from "../ux/new-item-icon";

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

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export default async function ContainerInstances() {
  const containers: Promise<ContainerInfo[]> = await fetch('http://localhost:3000/api/containers', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    next: {
      tags: ['virtual-machine'],
      revalidate: 10
    }
  }).then(res => res.json());
  async function deleteContainer(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    await fetch('http://localhost:3000/api/containers', {
      method: 'DELETE',
      body: JSON.stringify({ name })
    });
    revalidateTag('containers');
  }

  async function startContainer(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    await fetch('http://localhost:3000/api/containers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', name })
    });
    revalidateTag('containers');
  }

  async function stopContainer(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    await fetch('http://localhost:3000/api/containers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stop', name })
    });
    revalidateTag('containers');
  }

  async function refreshContainers(formData: FormData) {
    'use server';
    revalidateTag('containers');
  }

  return (
    <section className="space-y-4 mt-8">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
            Containers
          </h1>
          <p className="text-xs md:text-sm lg:text-base text-muted-foreground">
            Lista de containers e seus detalhes principais
          </p>
        </div>
        <span className="flex gap-2">
          <NewItemIcon
            icon={<PlusCircle className="h-4 w-4" />}
            destin="/container"
          />
          <form action={refreshContainers}>
            <Button variant="outline" size="icon" type="submit">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </form>
        </span>
      </div>

      <div className="rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="py-3 px-4 text-left font-medium">Nome</th>
                <th className="py-3 px-4 text-left font-medium">Imagem</th>
                <th className="py-3 px-4 text-left font-medium">Status</th>
                <th className="py-3 px-4 text-left font-medium">IP</th>
                <th className="py-3 px-4 text-left font-medium">Memória</th>
                <th className="py-3 px-4 text-left font-medium">CPU</th>
                <th className="py-3 px-4 text-left font-medium">Uptime</th>
                <th className="py-3 px-4 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(await containers).filter((con) => con.type === "container").map((container: ContainerInfo, index) => (
                <tr key={index} className="border-t hover:bg-muted/50">
                  <td className="py-3 px-4">{container.name}</td>
                  <td className="py-3 px-4">{container.config['image.os'].toLocaleLowerCase() || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(container.status)}`}>
                      {container.status || 'Pendente'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {container.state?.network?.eth0?.addresses?.[0]?.address ? (
                      <div className="flex gap-2">
                        <span>{container.state.network.eth0.addresses[0].address}</span>
                        <a href={`http://${container.state.network.eth0.addresses[0].address}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">HTTP</a>
                        <a href={`https://${container.state.network.eth0.addresses[0].address}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">HTTPS</a>
                      </div>
                    ) : container.state?.network?.enp5s0?.addresses?.[0]?.address ? (
                      <div className="flex gap-2">
                        <span>{container.state.network.enp5s0.addresses[0].address}</span>
                        <a href={`http://${container.state.network.enp5s0.addresses[0].address}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">HTTP</a>
                        <a href={`https://${container.state.network.enp5s0.addresses[0].address}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">HTTPS</a>
                      </div>
                    ) : '-'}
                  </td>                  <td className="py-3 px-4">
                    {formatBytes(container.state?.memory?.usage || 0)} / {formatBytes(container.state?.memory?.limit || 0)}
                  </td>
                  <td className="py-3 px-4">
                    {container.state?.cpu?.usage ? `${(container.state.cpu.usage / 1e9).toFixed(2)}s` : '-'}
                  </td>
                  <td className="py-3 px-4">
                    {container.state?.uptime ? formatUptime(container?.state?.uptime) : '-'}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <form action={startContainer}>
                          <input type="hidden" name="name" value={container.name} />
                          <DropdownMenuItem asChild>
                            <button type="submit" className="flex items-center gap-2">
                              <Play className="h-4 w-4" /> Iniciar
                            </button>
                          </DropdownMenuItem>
                        </form>
                        <form action={stopContainer}>
                          <input type="hidden" name="name" value={container.name} />
                          <DropdownMenuItem asChild>
                            <button type="submit" className="flex items-center gap-2">
                              <Square className="h-4 w-4" /> Parar
                            </button>
                          </DropdownMenuItem>
                        </form>
                        <form action={deleteContainer}>
                          <input type="hidden" name="name" value={container.name} />
                          <DropdownMenuItem asChild>
                            <button type="submit" className="flex items-center gap-2 text-red-600">
                              <Trash2 className="h-4 w-4" /> Excluir
                            </button>
                          </DropdownMenuItem>
                        </form>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
