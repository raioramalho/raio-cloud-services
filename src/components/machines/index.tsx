'use server';

import { Play, RefreshCw, Square, Trash2, PlusCircle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { revalidateTag } from "next/cache";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import NewItemIcon from "../ux/new-item-icon";

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Running':
      return 'bg-green-100 text-green-800';
    case 'Stopped':
      return 'bg-red-100 text-red-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default async function VirtualInstances() {
  const vms = await fetch('http://localhost:3000/api/machines', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    next: {
      tags: ['machines'],
      revalidate: 10
    }
  }).then(res => res.json());

  async function deleteVM(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const pid = Number(formData.get('pid'));
    const id = formData.get('id') as string;

    await fetch('http://localhost:3000/api/delete-instance', {
      method: 'POST',
      body: JSON.stringify({ name, pid, id }),
    });

    revalidateTag('machines');
  }

  async function startVM(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;

    await fetch('http://localhost:3000/api/start-instance', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });

    revalidateTag('machines');
  }

  async function stopVM(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;

    await fetch('http://localhost:3000/api/stop-instance', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });

    revalidateTag('machines');
  }

  async function refreshVMs(formData: FormData) {
    'use server';
    revalidateTag('machines');
  }

  return (
    <section className="space-y-4 mt-8">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
            Máquinas Virtuais
          </h1>
          <p className="text-xs md:text-sm lg:text-base text-muted-foreground">
            Lista de VMs e seus principais dados operacionais
          </p>
        </div>
        <span className="flex gap-2">
          {/* <Button variant="outline" size="icon" type="button"> */}
          <NewItemIcon
          icon={<PlusCircle className="h-4 w-4" />}
          destin="/instances/new"
          />
            
          {/* </Button> */}
          <form action={refreshVMs}>
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
                <th className="py-3 px-4 text-left font-medium">Status</th>
                <th className="py-3 px-4 text-left font-medium">Processo</th>
                <th className="py-3 px-4 text-left font-medium">IP</th>
                <th className="py-3 px-4 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vms.map((vm: any, index: number) => (
                <tr key={index} className="border-t hover:bg-muted/50">
                  <td className="py-3 px-4">{vm.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(vm.status)}`}>
                      {vm.status || 'Desconhecido'}
                    </span>
                  </td>
                  <td className="py-3 px-4">{vm.pid || '-'}</td>
                  <td className="py-3 px-4">{vm.ip || '-'}</td>
                  <td className="py-2 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <form action={startVM}>
                          <input type="hidden" name="id" value={vm.id} />
                          <DropdownMenuItem asChild>
                            <button type="submit" className="flex items-center gap-2">
                              <Play className="h-4 w-4" /> Iniciar
                            </button>
                          </DropdownMenuItem>
                        </form>
                        <form action={stopVM}>
                          <input type="hidden" name="id" value={vm.id} />
                          <DropdownMenuItem asChild>
                            <button type="submit" className="flex items-center gap-2">
                              <Square className="h-4 w-4" /> Parar
                            </button>
                          </DropdownMenuItem>
                        </form>
                        <form action={deleteVM}>
                          <input type="hidden" name="name" value={vm.name} />
                          <input type="hidden" name="pid" value={vm.pid} />
                          <input type="hidden" name="id" value={vm.id} />
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
