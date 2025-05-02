'use server';
import ContainerInstances from "@/components/containers";
import VirtualInstances from "@/components/machines";
export default async function Dashboard() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 md:p-8 lg:p-12 bg-background">      
      <div className="w-full max-w-7xl space-y-8 rounded-lg">
        <VirtualInstances />
        <ContainerInstances />
      </div>
    </main>
  );
}