'use client';

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Key as KeyIcon, 
  BarChart3 as ChartIcon, 
  Box as BoxIcon, 
  Users, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  FileText 
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Definição dos itens de navegação da sidebar
type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const SIDEBAR_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: <Home className="h-5 w-5" /> },
  // { label: "API Keys", href: "/keys", icon: <KeyIcon className="h-5 w-5" /> },
  // { label: "Uso", href: "/usage", icon: <ChartIcon className="h-5 w-5" /> },
  { label: "Produtos", href: "/product", icon: <BoxIcon className="h-5 w-5" /> },
  // { label: "Usuários", href: "/users", icon: <Users className="h-5 w-5" /> },
  // { label: "Faturamento", href: "/billing", icon: <CreditCard className="h-5 w-5" /> },
  // { label: "Configurações", href: "/settings", icon: <Settings className="h-5 w-5" /> },
];

// Componente de Header com logo e perfil
const Header = () => {
  return (
    <header className="h-16 border-b fixed top-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 z-50">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <div className="h-8 w-12 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">
            RCS
          </div>
          <span className="font-bold text-lg">Raio Cloud Services</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/docs" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Documentação</span>
            </Link>
          </Button>
          
          <Button variant="ghost" size="sm" asChild>
            <Link href="/support" className="flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              <span>Suporte</span>
            </Link>
          </Button>
          
          <Avatar className="cursor-pointer h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" alt="Perfil" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

// Componente de navegação lateral (Sidebar)
const SideNavigation = () => {
  const pathname = usePathname();
  
  return (
    <TooltipProvider delayDuration={300}>
      <aside className="fixed md:w-16 h-16 md:h-[calc(100vh-4rem)] bottom-0 left-0 right-0 md:bottom-0 md:top-16 md:left-0 md:right-auto flex md:flex-col items-center justify-around md:justify-start md:py-6 md:space-y-6 border-t md:border-t-0 md:border-r bg-background z-40">
        <nav className="flex md:flex-col items-center justify-around md:justify-start w-full md:space-y-2">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link 
                    href={item.href} 
                    className={cn(
                      "flex items-center justify-center h-10 w-10 rounded-md transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.icon}
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
};

// Componente principal que combina todos os elementos
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="pt-16 flex min-h-screen">
        <SideNavigation />
        
        <main className="flex-1 md:ml-16 p-4">
          <div className="container mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}