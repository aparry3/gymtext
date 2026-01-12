'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Home,
  Users,
  MessageSquare,
  Calendar,
  FileText,
  Presentation,
  Menu,
  ChevronLeft,
  LogOut,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEnvironment } from '@/context/EnvironmentContext';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/program-owners', label: 'Program Owners', icon: Building2 },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/demos', label: 'Demos', icon: Presentation },
  { href: '/prompts', label: 'Prompts', icon: FileText },
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

function EnvironmentToggleSidebar() {
  const { setMode, isProduction, isSandbox } = useEnvironment();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-[hsl(var(--sidebar-muted))]">
      <button
        onClick={() => setMode('production')}
        className={cn(
          'flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
          isProduction
            ? 'bg-green-600 text-white'
            : 'text-[hsl(var(--sidebar-foreground))]/70 hover:text-[hsl(var(--sidebar-foreground))]'
        )}
      >
        Production
      </button>
      <button
        onClick={() => setMode('sandbox')}
        className={cn(
          'flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
          isSandbox
            ? 'bg-amber-500 text-white'
            : 'text-[hsl(var(--sidebar-foreground))]/70 hover:text-[hsl(var(--sidebar-foreground))]'
        )}
      >
        Sandbox
      </button>
    </div>
  );
}

function SidebarContent({
  currentPath,
  onNavClick,
}: {
  currentPath: string;
  onNavClick?: () => void;
}) {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-2">
          {/* Close button - only shown in mobile sheet */}
          {onNavClick && (
            <button
              onClick={onNavClick}
              className="p-1 -ml-1 text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-muted))] rounded"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <Link href="/" className="flex items-center gap-2" onClick={onNavClick}>
            <Image
              src="/IconBG.png"
              alt="GymText"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-lg font-bold text-[hsl(var(--sidebar-foreground))]">
              GYMTEXT
            </span>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={
              item.href === '/'
                ? currentPath === '/'
                : currentPath.startsWith(item.href)
            }
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-[hsl(var(--sidebar-border))] space-y-3">
        {/* Environment toggle */}
        <EnvironmentToggleSidebar />

        {/* Logout button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-[hsl(var(--sidebar-foreground))]/70 hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-muted))]"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
            hideCloseButton
            className="w-64 p-0 bg-[hsl(var(--sidebar-bg))] border-[hsl(var(--sidebar-border))]"
          >
            <SidebarContent
              currentPath={pathname}
              onNavClick={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Image
            src="/IconBG.png"
            alt="GymText"
            width={28}
            height={28}
            className="rounded-lg"
          />
          <span className="text-base font-bold text-[hsl(var(--sidebar-foreground))]">
            GYMTEXT
          </span>
        </div>
      </div>

      {/* Desktop sidebar - fixed */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-[hsl(var(--sidebar-bg))]">
        <SidebarContent currentPath={pathname} />
      </aside>
    </>
  );
}
