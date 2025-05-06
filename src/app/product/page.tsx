/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';
import ContainerInstances from "@/components/containers";
import VirtualInstances from "@/components/machines";
export default async function Dashboard() {

  const containers: any[] = await fetch('http://localhost:3000/api/containers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      next: {
        tags: ['instances'],
        revalidate: 3
      }
    }).then(res => res.json());

  return (
    <main className="flex min-h-screen items-center justify-center p-4 md:p-8 lg:p-12 bg-background">      
      <div className="w-full max-w-7xl space-y-8 rounded-lg">
        <VirtualInstances containers={containers}/>
        <ContainerInstances containers={containers} />
      </div>
    </main>
  );
}