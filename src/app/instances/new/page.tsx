"use server";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import fs from 'fs';
import path from 'path';
import BackButton from "@/components/ux/back-button";
import { redirect } from 'next/navigation';

const regions = [
  { value: "br-centro-1", label: "Brasil Centro" },
  { value: "br-sudeste-1", label: "Brasil Sudeste" },
  { value: "br-norte-1", label: "Brasil Norte" },
];
const vmSizes = [
  { value: "small", label: "Pequena (2 vCPU, 4GB RAM)", cpu: 2, memory: '4G' },
  { value: "medium", label: "Média (4 vCPU, 8GB RAM)", cpu: 4, memory: '8G' },
  { value: "large", label: "Grande (8 vCPU, 16GB RAM)", cpu: 8, memory: '16G' },
];

export default async function NewVirtualMachinePage() {
  const images = fs.readdirSync(path.join(process.cwd(), 'public/images'));

  async function handleSubmit(data: FormData) {
    "use server";
    const vmName = data.get("vmName");
    const vmSize = data.get("vmSize") as string;
    const diskSize = data.get("diskSize");
    const image = data.get("image");
    const sshKey = data.get("sshKey");
    const userName = data.get("userName");

    const selectedSize = vmSizes.find(size => size.value === vmSize);

    const req = await fetch("http://localhost:3000/api/new-instance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: vmName,
        size: {
          cpu: selectedSize?.cpu,
          memory: selectedSize?.memory
        },
        diskSize: diskSize,
        image: image,
        sshKey: sshKey,
        userName: userName,
      }),
    });

    if (req.status === 200) {
      redirect('/');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 md:p-8 lg:p-12 bg-background">
      <form className="w-full max-w-4xl space-y-8 rounded-lg border p-4 md:p-6 lg:p-8 shadow-lg" action={handleSubmit}>
        {/* Etapa 1: Informações Básicas */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="vmName" className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
              Criar Máquina Virtual
            </Label>
            <p className="text-xs md:text-sm lg:text-base text-muted-foreground">
              Configure sua nova máquina virtual seguindo as etapas abaixo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div className="space-y-2">
              <Label htmlFor="vmName" className="text-sm md:text-base lg:text-lg">Nome da VM</Label>
              <Input type="text" name="vmName" placeholder="Digite o nome da VM" required className="text-sm md:text-base" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region" className="text-sm md:text-base lg:text-lg">Região</Label>
              <Select name="region" required>
                <SelectTrigger className="w-full text-sm md:text-base">
                  <SelectValue placeholder="Selecione a região..." />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.value} value={region.value} className="text-sm md:text-base">
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Etapa 2: Configurações da VM */}
        <div className="space-y-6">
          <h3 className="text-lg md:text-xl lg:text-2xl font-semibold">Configurações da VM</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm md:text-base lg:text-lg">Imagem</Label>
              <Select name="image" required>
                <SelectTrigger className="w-full text-sm md:text-base">
                  <SelectValue placeholder="Selecione a imagem..." />
                </SelectTrigger>
                <SelectContent>
                  {images.map((image) => (
                    <SelectItem key={image} value={image} className="text-sm md:text-base">
                      {image}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vmSize" className="text-sm md:text-base lg:text-lg">Tamanho da VM</Label>
              <Select name="vmSize" required>
                <SelectTrigger className="w-full text-sm md:text-base">
                  <SelectValue placeholder="Selecione o tamanho da VM..." />
                </SelectTrigger>
                <SelectContent>
                  {vmSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value} className="text-sm md:text-base">
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Etapa 3: Armazenamento e Segurança */}
        <div className="space-y-6">
          <h3 className="text-lg md:text-xl lg:text-2xl font-semibold">Armazenamento e Segurança</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="diskSize" className="text-sm md:text-base lg:text-lg">Tamanho do Disco (GB)</Label>
              <Input type="number" name="diskSize" placeholder="Digite o tamanho do disco em GB" required min="10" className="text-sm md:text-base" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userName" className="text-sm md:text-base lg:text-lg">Nome do Usuário</Label>
              <Input type="text" name="userName" placeholder="Digite o nome do usuário" required className="text-sm md:text-base" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sshKey" className="text-sm md:text-base lg:text-lg">Chave Pública SSH</Label>
              <Textarea 
                name="sshKey" 
                placeholder="Cole sua chave pública SSH aqui" 
                required 
                className="min-h-[100px] text-sm md:text-base"
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full text-sm md:text-base lg:text-lg py-2 md:py-3">
          Criar VM
        </Button>
        <BackButton/>
      </form>
    </main>
  );
}
