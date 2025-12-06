import { Zap } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 md:gap-6 text-center">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            <span className="font-display text-xl md:text-2xl">
              <span className="text-primary">contigo</span>
            </span>
            <span className="text-[10px] md:text-xs text-muted-foreground tracking-widest uppercase">
              Electric Inc.
            </span>
          </div>

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
