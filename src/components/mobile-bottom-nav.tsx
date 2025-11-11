
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { navItems } from '@/app/dashboard/layout';
import { useEffect, useState } from 'react';

type MobileBottomNavProps = {
  items: typeof navItems;
};

export default function MobileBottomNav({ items }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 50) { // if scroll down hide the navbar
          setIsHidden(true);
        } else { // if scroll up show the navbar
          setIsHidden(false);
        }
        // remember current page location to use in the next move
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);

      // cleanup function
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);

  return (
    <div className={cn(
        "fixed bottom-4 left-4 right-4 z-50 h-[72px] md:hidden transition-transform duration-300",
        isHidden ? "translate-y-[120px]" : "translate-y-0"
    )}>
      <div className="relative flex h-full items-center justify-around rounded-2xl border bg-background/80 shadow-lg ring-1 ring-black/5 backdrop-blur-md">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium"
            >
              <item.icon
                className={cn(
                  'h-6 w-6 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
