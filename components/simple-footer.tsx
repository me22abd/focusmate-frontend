import { cn } from '@/lib/utils';

interface SimpleFooterProps {
  className?: string;
  variant?: 'public' | 'auth';
}

export function SimpleFooter({ className, variant = 'public' }: SimpleFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'w-full border-t border-transparent py-6 text-center text-sm text-muted-foreground',
        variant === 'auth' ? 'bg-transparent' : 'bg-background',
        className,
      )}
    >
      <p>© {currentYear} Marvelous Eromonsele — All Rights Reserved</p>
      <p className="text-xs mt-1">Developed as a Final-Year Project under the supervision of Tamie Salter</p>
    </footer>
  );
}






