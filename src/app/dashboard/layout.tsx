
'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Bell,
  Home,
  Briefcase,
  LogOut,
  Settings,
  User,
  Loader2,
  Moon,
  Sun,
  Package,
  Calculator,
  Search,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import ChatAssistant from '@/components/chat-assistant';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/mobile-bottom-nav';
import { useAuth } from '@/hooks/use-auth';

export const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['Admin', 'Client'] },
  { href: '/dashboard/projects', label: 'Projects', icon: Briefcase, roles: ['Admin', 'Client'] },
  { href: '/dashboard/estimator', label: 'Estimator', icon: Calculator, roles: ['Admin'] },
  { href: '/dashboard/materials', label: 'Materials', icon: Package, roles: ['Admin', 'Client'] },
];

function UserAvatar() {
  const { setTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user.photoURL || ''}
              alt={user.displayName || 'User'}
              data-ai-hint="person face"
            />
            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{user.displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light Theme</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark Theme</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isSidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const { sessionRole, loading, user } = useAuth();
  const router = useRouter();


  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);


  const filteredNavItems = React.useMemo(() => {
    if (!sessionRole) return [];
    return navItems.filter((item) => item.roles.includes(sessionRole));
  }, [sessionRole]);

  const getIsActive = (href: string) => {
    if (href === '/dashboard') {
        return pathname === href;
    }
    return pathname.startsWith(href);
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }
  
  if (sessionRole === 'Client') {
    return (
      <TooltipProvider>
        <div className="flex flex-col min-h-screen w-full bg-muted/40">
           <header className={cn(
              "sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card/50 px-4 backdrop-blur-sm sm:h-16 sm:px-6",
            )}>
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <Image src="/my_logo.png" alt="Logo" width={32} height={32} className="dark:invert"/>
                <span className="hidden sm:inline-block">GeminiEstimate</span>
              </Link>

              <div className="ml-auto flex items-center gap-2">
                 <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                    <Bell className="h-4 w-4" />
                    <span className="sr-only">Toggle notifications</span>
                </Button>
                <UserAvatar />
              </div>
           </header>
            <main className="flex-1 p-4 sm:p-6 pb-24">
                {children}
            </main>
           <ChatAssistant />
           <MobileBottomNav items={filteredNavItems} />
        </div>
      </TooltipProvider>
    );
  }

  // Admin Layout
  return (
    <TooltipProvider>
       <div className={cn(
           "min-h-screen w-full bg-muted/40 flex", 
           !isMobile && (isSidebarCollapsed ? "pl-20" : "pl-64")
        )}>
          {!isMobile && (
             <aside className={cn(
                "fixed left-0 z-40 h-[calc(100vh-2rem)] top-4 transition-all duration-300 ease-in-out",
                isSidebarCollapsed ? "w-20" : "w-64"
             )}>
                <div className="flex h-full max-h-screen flex-col rounded-lg border bg-card">
                    <div className={cn("flex items-center border-b h-20 shrink-0", isSidebarCollapsed ? 'px-4 justify-center' : 'px-8 justify-center')}>
                       <Button variant="ghost" size="icon" onClick={() => setSidebarCollapsed(!isSidebarCollapsed)} className={cn("rounded-full", isSidebarCollapsed ? 'h-10 w-10' : 'h-12 w-12')}>
                           <Image src="/my_logo.png" alt="Logo" width={isSidebarCollapsed ? 32 : 48} height={isSidebarCollapsed ? 32 : 48} className="dark:invert"/>
                           <span className="sr-only">Toggle Sidebar</span>
                        </Button>
                    </div>
                     <nav className="flex flex-col items-stretch justify-center gap-1 p-2 flex-1">
                        {filteredNavItems.map((item) => {
                          const isActive = getIsActive(item.href);
                          return isSidebarCollapsed ? (
                            <Tooltip key={item.href} delayDuration={0}>
                              <TooltipTrigger asChild>
                                 <Link
                                    href={item.href}
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                                        isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="sr-only">{item.label}</span>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent side="right">{item.label}</TooltipContent>
                            </Tooltip>
                          ) : (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              )}
                            >
                              <item.icon className="h-4 w-4" />
                              {item.label}
                            </Link>
                          )
                        })}
                    </nav>
                     <div className={cn(
                        "mt-auto flex p-4",
                        !isSidebarCollapsed ? "flex-col items-start gap-4" : "flex-col items-center gap-2"
                      )}>
                       <UserAvatar />
                    </div>
                </div>
            </aside>
          )}
       
          <div className={cn("flex flex-col flex-1", isMobile && "pb-24")}>
             <header className={cn(
                "sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card/50 px-4 backdrop-blur-sm sm:h-auto sm:border-0 sm:bg-transparent sm:px-6",
              )}>
                
                {isMobile && (
                  <>
                  <Link href="#" className="flex items-center gap-2 font-semibold">
                    <Image src="/my_logo.png" alt="Logo" width={32} height={32} className="dark:invert"/>
                    <span className="">GeminiEstimate</span>
                  </Link>
                  <div className="ml-auto flex items-center gap-2">
                     <Button variant="outline" size="icon" className="rounded-full">
                        <Bell className="h-5 w-5" />
                        <span className="sr-only">Toggle notifications</span>
                    </Button>
                    <UserAvatar />
                  </div>
                  </>
                )}

                 <div className={cn("relative ml-auto flex-1 md:grow-0", isMobile && "hidden")}>
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full rounded-lg bg-card pl-8 md:w-[200px] lg:w-[320px] shadow-sm"
                    />
                </div>
                
                 <div className={cn("flex items-center gap-2 md:ml-2", isMobile && "hidden")}>
                    <Button variant="outline" size="icon" className="rounded-full">
                        <Bell className="h-5 w-5" />
                        <span className="sr-only">Toggle notifications</span>
                    </Button>
                 </div>
            </header>

            <main className={cn(
              "flex-1 p-4 sm:p-6",
              isMobile && "pt-0"
              )}>
                {children}
            </main>
        </div>
        
        {isMobile && <MobileBottomNav items={filteredNavItems} />}
      </div>
    </TooltipProvider>
  );
}
