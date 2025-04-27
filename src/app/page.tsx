import fs from 'fs';
import path from 'path';
import NewInstanceButton from "@/components/ux/new-instance-button";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Trash2, Play, Square } from "lucide-react";
import { revalidatePath } from 'next/cache';
import { VirtualMachineSettings } from './api/types/instance.types';

export default async function Home() {
  const vmFiles = fs.readdirSync(path.join(process.cwd(), 'tmp'));
  const vms = vmFiles.filter(file => file.endsWith('.json')).map(file => {
    const content = fs.readFileSync(path.join(process.cwd(), 'tmp', file), 'utf8');
    return JSON.parse(content) as VirtualMachineSettings;
  });

  async function deleteVM(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const pid = Number(formData.get('pid'));
    const id = formData.get('id') as string;

    await fetch('http://localhost:3000/api/delete-instance', {     
      method: 'POST',
      body: JSON.stringify({ name, pid, id }),
    });
    
    revalidatePath('/');
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
    
    revalidatePath('/');
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
    
    revalidatePath('/');
  }

  async function refresh() {
    'use server';
    revalidatePath('/');
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-800';
      case 'Inativo':
        return 'bg-red-100 text-red-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 md:p-8 lg:p-12 bg-background">
      <div className="w-full max-w-4xl space-y-8 rounded-lg border p-4 md:p-6 lg:p-8 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
              Máquinas Virtuais
            </h1>
            <p className="text-xs md:text-sm lg:text-base text-muted-foreground">
              Lista de máquinas virtuais e seus status
            </p>
          </div>
          <form action={refresh}>
            <Button variant="outline" size="icon" type="submit">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>VM</TableHead>
              <TableHead>Imagem Base</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vms.map((vm, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{vm.name}</TableCell>
                <TableCell>{vm.baseImage}</TableCell>
                <TableCell>{vm.username}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-sm rounded-full ${getStatusStyle(vm.status)}`}>
                    {vm.status || 'Pendente'}
                  </span>
                </TableCell>
                <TableCell className="flex gap-2">
                  <form action={startVM}>
                    <input type="hidden" name="id" value={vm.id} />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      type="submit"
                    >
                      <Play className="h-4 w-4 text-green-500" />
                    </Button>
                  </form>
                  <form action={stopVM}>
                    <input type="hidden" name="id" value={vm.id} />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      type="submit"
                    >
                      <Square className="h-4 w-4 text-yellow-500" />
                    </Button>
                  </form>
                  <form action={deleteVM}>
                    <input type="hidden" name="name" value={vm.name} />
                    <input type="hidden" name="pid" value={vm.pid} />
                    <input type="hidden" name="id" value={vm.id} />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      type="submit"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <NewInstanceButton />
      </div>
    </main>
  );
}