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
import { DeployButton } from "./deploy-button";

export async function getProjects(): Promise<
  {
    id: string;
    name: string;
    port: string;
    branch: string;
    status: string;
  }[]
> {
  const mockProjects = [
    {
      id: "project1",
      name: "Project 1",
      port: "9090",
      branch: "main",
      status: "stopped",
    },
    {
      id: "project2",
      name: "Project 2",
      port: "9091",
      branch: "main",
      status: "running",
    },
  ];
  return mockProjects;
}

export default async function Home() {
  const projects = await getProjects();

  async function handleSubmit(data: FormData) {
    "use server";
    // Handle form submission here
    console.log(data);
    const project = data.get("project");

    await fetch("http://localhost/api/deploy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projetoId: project,
      }),
    });
  }

  return (
    <main className="p-4">
      <form className="max-w-md space-y-4" action={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="project" className="text-2xl font-bold">
            Select Project
          </Label>
          <Select name="project">
            <SelectTrigger>
              <SelectValue placeholder="Select a project..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name} ({project.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DeployButton />
      </form>
    </main>
  );
}
