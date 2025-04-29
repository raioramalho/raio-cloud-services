'use client'
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

// Definição de tipos para as opções de navegação
type NavItem = {
  label: string;
  href: string;
};

// Lista centralizada de links de navegação para evitar duplicação
const NAV_ITEMS: NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Sobre nós", href: "/sobre" },
  { label: "Produtos", href: "/produtos" },
  { label: "Contato", href: "/contato" },
];

// Componente para o logotipo - separei para melhorar a organização
const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      {/* Se você tiver um SVG ou imagem para o logo */}
      <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">
        RC
      </div>
      <span className="font-bold text-lg hidden sm:block">Raio Cloud Systems</span>
    </div>
  );
};

// Componente para os links de navegação desktop
const DesktopNav = () => {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex items-center space-x-1">
      {NAV_ITEMS.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? "default" : "ghost"}
          size="sm"
          asChild
          className="font-medium"
        >
          <Link href={item.href}>{item.label}</Link>
        </Button>
      ))}
    </div>
  );
};

// Componente para navegação mobile
const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[240px] sm:w-[300px]">
        <nav className="flex flex-col gap-4 mt-8">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "default" : "ghost"}
              className="justify-start"
              asChild
              onClick={() => setOpen(false)}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <DesktopNav />
        <div className="flex items-center gap-2">
          {/* Aqui você pode adicionar botões adicionais como login, tema, etc */}
          <Button variant="outline" size="sm" className="hidden sm:flex">
            Login
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}