import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navigation = () => {
  return (
    <div className="ml-10 flex items-center space-x-4">
      <Button variant="ghost" asChild>
        <a href="/">Inicio</a>
      </Button>
      <Button variant="ghost" asChild>
        <a href="#">Sobre nós</a>
      </Button>
      <Button variant="ghost" asChild>
        <a href="#">Produtos</a>
      </Button>
      <Button variant="ghost" asChild>
        <a href="#">Contato</a>
      </Button>
    </div>
  );
};

const MobileNavigation = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <div className="flex flex-col space-y-4 mt-4">
          <Button variant="ghost" asChild>
            <a href="#">Inicio</a>
          </Button>
          <Button variant="ghost" asChild>
            <a href="#">Sobre nós</a>
          </Button>
          <Button variant="ghost" asChild>
            <a href="#">Produtos</a>
          </Button>
          <Button variant="ghost" asChild>
            <a href="#">Contato</a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-background border-b rounded-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex flex-row gap-4">
            {/* <HandshakeIcon className="h-8 w-8" /> */}
            {/* <Label className="text-xl font-bold">Raio Cloud Systems</Label> */}
          </div>
          <div className="hidden md:block">
            <Navigation />
          </div>
          <div className="md:hidden flex flex-col justify-center items-center">
            <MobileNavigation />
          </div>
        </div>
      </div>
    </nav>
  );
}