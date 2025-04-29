'use server';
import ContainerInstances from "@/components/containers";
import VirtualInstances from "@/components/machines";
export default async function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 md:p-8 lg:p-12 bg-background">
      <div className="w-full max-w-7xl space-y-8 rounded-lg border p-4 md:p-6 lg:p-8 shadow-lg">
        <VirtualInstances />
        <ContainerInstances />
      </div>
    </main>
  );
}