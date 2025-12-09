'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Home,
  BookOpen,
  User,
  LogOut,
  Menu,
  Dumbbell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MeSidebarProps {
  user: {
    name: string;
    programType?: string;
  };
}

const navItems = [
  { href: '/me', label: 'Dashboard', icon: Home },
  { href: '/me/plan', label: 'My Plan', icon: BookOpen },
  { href: '/me/profile', label: 'Profile', icon: User },
];

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-[hsl(var(--sidebar-accent))] text-white'
          : 'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-muted))]'
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

function SidebarContent({
  user,
  currentPath,
  onLogout,
  onNavClick,
}: {
  user: MeSidebarProps['user'];
  currentPath: string;
  onLogout: () => void;
  onNavClick?: () => void;
}) {
  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '??';

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-[hsl(var(--sidebar-border))]">
        <Link href="/me" className="flex items-center gap-2" onClick={onNavClick}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--sidebar-accent))]">
            <Dumbbell className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-[hsl(var(--sidebar-foreground))]">
            GYMTEXT
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={
              item.href === '/me'
                ? currentPath === '/me'
                : currentPath.startsWith(item.href)
            }
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-3 mb-3">
          <Avatar size="sm">
            <AvatarFallback className="bg-[hsl(var(--sidebar-muted))] text-[hsl(var(--sidebar-foreground))] text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[hsl(var(--sidebar-foreground))] truncate">
              {user.name}
            </p>
            {user.programType && (
              <p className="text-xs text-[hsl(var(--sidebar-foreground))]/60 truncate">
                {user.programType}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="w-full justify-start gap-2 text-[hsl(var(--sidebar-foreground))]/70 hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-muted))]"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export function MeSidebar({ user }: MeSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/me/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <>
      {/* Mobile hamburger button - fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center gap-3 p-4 bg-[hsl(var(--sidebar-bg))] md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-muted))]"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-64 p-0 bg-[hsl(var(--sidebar-bg))] border-[hsl(var(--sidebar-border))]"
          >
            <SidebarContent
              user={user}
              currentPath={pathname}
              onLogout={handleLogout}
              onNavClick={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--sidebar-accent))]">
            <Dumbbell className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-base font-bold text-[hsl(var(--sidebar-foreground))]">
            GYMTEXT
          </span>
        </div>
      </div>

      {/* Desktop sidebar - fixed */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-[hsl(var(--sidebar-bg))]">
        <SidebarContent
          user={user}
          currentPath={pathname}
          onLogout={handleLogout}
        />
      </aside>
    </>
  );
}
