'use server';

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function Container() {
  // Obter as imagens disponíveis
  const images: { alias: string; description: string; architecture: string }[] = await fetch('http://localhost:3000/api/images', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    next: {
      tags: ['images'],
      revalidate: 60
    }
  }).then(res => res.json());

  async function createContainer(formData: FormData) {
    'use server';
    
    const name = formData.get('name') as string;
    const image = formData.get('image') as string;
    const memory = formData.get('memory') as string;
    const cpu = formData.get('cpu') as string;
    const autostart = formData.get('autostart') === 'true';
    
    // Configurações de rede
    const networkType = formData.get('networkType') as string;
    const ipAddress = formData.get('ipAddress') as string;
    
    // Configurações de armazenamento
    const rootSize = formData.get('rootSize') as string;
    
    // Construir objeto de configuração
    const config = {
      name,
      image,
      config: {
        "limits.memory": `${memory}MB`,
        "limits.cpu": cpu,
        "boot.autostart": autostart ? "true" : "false"
      },
      network: {
        type: networkType,
        ipv4: networkType === 'static' ? ipAddress : 'dhcp'
      },
      storage: {
        root: {
          size: `${rootSize}GB`
        }
      }
    };
    
    // Enviar requisição para criar o container
    await fetch('http://localhost:3000/api/containers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    
    // Revalidar os dados de containers e redirecionar
    revalidateTag('containers');
    redirect('/containers');
  }

  return (
    <section className="space-y-4 mt-8">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
            Criar Container
          </h1>
          <p className="text-xs md:text-sm lg:text-base text-muted-foreground">
            Configure e crie um novo container
          </p>
        </div>
        <Link href="/containers">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      <form action={createContainer}>
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Defina o nome e as configurações essenciais do container
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="network">Rede</TabsTrigger>
                <TabsTrigger value="storage">Armazenamento</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome do Container</Label>
                    <Input id="name" name="name" placeholder="ex: meu-container" required />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="image">Imagem</Label>
                    <Select name="image" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma imagem" />
                      </SelectTrigger>
                      <SelectContent>
                        {images.map((image, index) => (
                          <SelectItem key={index} value={image.alias}>
                            {image.alias} ({image.architecture})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="memory">Limite de Memória (MB)</Label>
                    <Input id="memory" name="memory" type="number" defaultValue="512" required />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="cpu">Limite de CPU (cores)</Label>
                    <Input id="cpu" name="cpu" type="number" defaultValue="1" required />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="autostart" 
                      name="autostart" 
                      value="true"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                    />
                    <Label htmlFor="autostart">Iniciar automaticamente</Label>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="network" className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="networkType">Tipo de Rede</Label>
                    <Select name="networkType" defaultValue="dhcp">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de rede" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dhcp">DHCP (automático)</SelectItem>
                        <SelectItem value="static">IP Estático</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="ipAddress">Endereço IP (apenas para IP estático)</Label>
                    <Input id="ipAddress" name="ipAddress" placeholder="ex: 192.168.1.100" />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="storage" className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="rootSize">Tamanho do Disco Root (GB)</Label>
                    <Input id="rootSize" name="rootSize" type="number" defaultValue="10" required />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Criar Container
            </Button>
          </CardFooter>
        </Card>
      </form>
    </section>
  );
}