import logo from "@/assets/logo.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 md:gap-6 text-center">
          <img 
            src={logo} 
            alt="Contigo Electric" 
            className="h-10 md:h-12 w-auto"
          />

          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-6 text-xs md:text-sm text-muted-foreground">
            <span>License: EC13007893</span>
            <span className="hidden md:inline">•</span>
            <span>Certified Electrical Contractor</span>
            <span className="hidden md:inline">•</span>
            <span>Orlando, FL</span>
          </div>

          <div className="text-xs md:text-sm text-muted-foreground">
            © {currentYear} Contigo Electric Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
