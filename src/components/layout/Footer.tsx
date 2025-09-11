import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t bg-white/70 dark:bg-gray-950/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
        <div className="text-muted-foreground">
          © {new Date().getFullYear()} LabManager Pro. All rights reserved.
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Developed by</span>
          <a
            href="https://it4b.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-sm"
            aria-label="Developed by IT4B.in"
          >
            <span className="h-2 w-2 rounded-full bg-primary" />
            IT4B.in
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
