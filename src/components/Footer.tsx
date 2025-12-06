import { Zap } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="font-display text-2xl">
              <span className="text-primary">contigo</span>
            </span>
            <span className="text-xs text-muted-foreground tracking-widest uppercase">
              Electric Inc.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>License: EC13007893</span>
            <span>•</span>
            <span>Certified Electrical Contractor</span>
            <span>•</span>
            <span>Orlando, FL</span>
          </div>

          <div className="text-sm text-muted-foreground">
            © {currentYear} Contigo Electric Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
