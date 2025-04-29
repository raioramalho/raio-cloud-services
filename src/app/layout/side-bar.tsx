import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  BoxIcon,
  ChartColumnBig,
  CreditCard,
  HandshakeIcon,
  Home,
  KeyIcon,
  Settings,
  Users,
} from "lucide-react";

export default function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="h-16 border-b fixed top-0 left-0 right-0 bg-background flex items-center px-4 z-50">
        <div className="flex flex-row justify-between items-center w-full">
          <Label className="text-white text-xl font-bold">Raio Cloud Systems</Label>
          <span className="flex flex-row items-center gap-2">
            <Button variant={"link"} className="font-light">
              Documentação
            </Button>
            <Button variant={"link"} className="font-light">
              Suporte
            </Button>
            <Avatar className="cursor-pointer">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </span>
        </div>
      </nav>
      <div className="flex mt-4">
        <aside className="fixed md:w-16 md:h-[calc(100vh-4rem)] md:flex-col bottom-0 left-0 right-0 md:left-auto md:right-auto h-16 w-full flex items-center justify-around md:justify-start md:py-4 md:space-y-4 md:border-r border-t md:border-t-0 bg-background">
          <a href="/#">
            <button className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-700">
              <Home />
            </button>
          </a>

          <a href="/keys">
            <button className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-700">
              <KeyIcon />
            </button>
          </a>

          <a href="/usage">
            <button className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-700">
              <ChartColumnBig />
            </button>
          </a>
          <a href="/product">
          <button className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-700">
            <BoxIcon />
          </button>
          </a>
          <button className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-700">
            <Users />
          </button>
          <button className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-700">
            <CreditCard />
          </button>
          <button className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-700">
            <Settings />
          </button>
        </aside>
        <main className="flex flex-col justify-center items-center w-full mb-16 md:mb-0 md:ml-16">
          {children}
        </main>
      </div>
    </div>
  );
}