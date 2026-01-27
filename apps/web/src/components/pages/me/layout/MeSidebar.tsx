'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  ArrowLeft,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MeSidebarProps {
  user: {
    name: string;
    programType?: string;
  };
  /** Base path for navigation links (default: '/me') */
  basePath?: string;
  /** Whether this is an admin viewing a user's dashboard */
  isAdminView?: boolean;
  /** URL to return to when in admin view */
  adminBackUrl?: string;
}

const getNavItems = (basePath: string) => [
  { href: basePath, label: 'Dashboard', icon: Home },
  { href: `${basePath}/plan`, label: 'My Plan', icon: BookOpen },
  { href: `${basePath}/profile`, label: 'Profile', icon: User },
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
  basePath = '/me',
  isAdminView = false,
  adminBackUrl,
}: {
  user: MeSidebarProps['user'];
  currentPath: string;
  onLogout: () => void;
  onNavClick?: () => void;
  basePath?: string;
  isAdminView?: boolean;
  adminBackUrl?: string;
}) {
  const navItems = getNavItems(basePath);
  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '??';

  return (
    <div className="flex flex-col h-full">
      {/* Logo with close button for mobile */}
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
          <Link href={basePath} className="flex items-center" onClick={onNavClick}>
            <Image
              src="/WordmarkWhite.png"
              alt="GymText"
              width={100}
              height={24}
              className="h-6 w-auto"
            />
          </Link>
        </div>
      </div>

      {/* Admin View Banner */}
      {isAdminView && (
        <div className="px-4 py-2 bg-amber-500/20 border-b border-amber-500/30">
          <p className="text-xs font-medium text-amber-200 text-center">
            Viewing as: {user.name}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={
              item.href === basePath
                ? currentPath === basePath
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
        {isAdminView && adminBackUrl ? (
          <Link href={adminBackUrl}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-[hsl(var(--sidebar-foreground))]/70 hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-muted))]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="w-full justify-start gap-2 text-[hsl(var(--sidebar-foreground))]/70 hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-muted))]"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        )}
      </div>
    </div>
  );
}

export function MeSidebar({ user, basePath = '/me', isAdminView = false, adminBackUrl }: MeSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    if (isAdminView) return; // Don't logout when in admin view
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
            hideCloseButton
            className="w-64 p-0 bg-[hsl(var(--sidebar-bg))] border-[hsl(var(--sidebar-border))]"
          >
            <SidebarContent
              user={user}
              currentPath={pathname}
              onLogout={handleLogout}
              onNavClick={() => setMobileOpen(false)}
              basePath={basePath}
              isAdminView={isAdminView}
              adminBackUrl={adminBackUrl}
            />
          </SheetContent>
        </Sheet>
        <Image
          src="/WordmarkWhite.png"
          alt="GymText"
          width={100}
          height={24}
          className="h-5 w-auto"
        />
      </div>

      {/* Desktop sidebar - fixed */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-[hsl(var(--sidebar-bg))]">
        <SidebarContent
          user={user}
          currentPath={pathname}
          onLogout={handleLogout}
          basePath={basePath}
          isAdminView={isAdminView}
          adminBackUrl={adminBackUrl}
        />
      </aside>
    </>
  );
}
