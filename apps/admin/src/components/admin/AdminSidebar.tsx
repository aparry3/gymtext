'use client'

import { useEffect, useState, type ComponentType } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Home,
  Users,
  MessageSquare,
  Calendar,
  FileText,
  Presentation,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
  Landmark,
  ClipboardList,
  Dumbbell,
  Bot,
  ScrollText,
  ArrowUpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEnvironment } from '@/context/EnvironmentContext'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/program-owners', label: 'Program Owners', icon: Building2 },
  { href: '/organizations', label: 'Organizations', icon: Landmark },
  { href: '/programs', label: 'Programs', icon: ClipboardList },
  { href: '/exercises', label: 'Exercises', icon: Dumbbell },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/demos', label: 'Demos', icon: Presentation },
  { href: '/registry', label: 'Registry', icon: FileText },
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/agent-logs', label: 'Agent Logs', icon: ScrollText },
  { href: '/promote', label: 'Promote', icon: ArrowUpCircle },
]

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  collapsed,
  onClick,
}: {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
  isActive: boolean
  collapsed?: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        collapsed ? 'justify-center' : 'gap-3',
        isActive
          ? 'bg-[hsl(var(--sidebar-accent))] text-white'
          : 'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-muted))]'
      )}
    >
      <Icon className="h-5 w-5" />
      {!collapsed && label}
    </Link>
  )
}

function EnvironmentToggleSidebar({ collapsed }: { collapsed?: boolean }) {
  const { setMode, isProduction, isSandbox } = useEnvironment()

  if (collapsed) {
    return (
      <button
        onClick={() => setMode(isProduction ? 'sandbox' : 'production')}
        className={cn(
          'w-full rounded-lg border px-2 py-2 text-xs font-medium transition-colors',
          isProduction
            ? 'border-green-500/40 bg-green-500/20 text-green-100'
            : 'border-amber-500/40 bg-amber-500/20 text-amber-100'
        )}
        title="Toggle environment"
      >
        {isProduction ? 'Prod' : 'SB'}
      </button>
    )
  }

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
  )
}

function SidebarContent({
  currentPath,
  collapsed,
  onToggleCollapse,
  onNavClick,
}: {
  currentPath: string
  collapsed?: boolean
  onToggleCollapse?: () => void
  onNavClick?: () => void
}) {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (err) {
      console.error('Error logging out:', err)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[hsl(var(--sidebar-border))] relative">
        {onNavClick && (
          <button
            onClick={onNavClick}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-1 text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-muted))] rounded"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {!onNavClick && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-muted))]"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}

        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-center')}>
          <Link href="/" className="flex items-center" onClick={onNavClick}>
            {collapsed ? (
              <span className="rounded-lg bg-[hsl(var(--sidebar-muted))] px-2 py-1 text-xs font-semibold text-[hsl(var(--sidebar-foreground))]">
                GT
              </span>
            ) : (
              <Image
                src="/WordmarkWhite.png"
                alt="GymText"
                width={120}
                height={28}
              />
            )}
          </Link>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            collapsed={collapsed}
            isActive={
              item.href === '/'
                ? currentPath === '/'
                : currentPath.startsWith(item.href)
            }
            onClick={onNavClick}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-[hsl(var(--sidebar-border))] space-y-3">
        <EnvironmentToggleSidebar collapsed={collapsed} />

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            'w-full gap-2 text-[hsl(var(--sidebar-foreground))]/70 hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-muted))]',
            collapsed ? 'justify-center px-0' : 'justify-start'
          )}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && 'Sign Out'}
        </Button>
      </div>
    </div>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem('admin-sidebar-collapsed')
    const nextCollapsed = stored === 'true'
    setCollapsed(nextCollapsed)
    document.documentElement.style.setProperty('--admin-sidebar-width', nextCollapsed ? '5rem' : '16rem')
  }, [])

  useEffect(() => {
    window.localStorage.setItem('admin-sidebar-collapsed', collapsed ? 'true' : 'false')
    document.documentElement.style.setProperty('--admin-sidebar-width', collapsed ? '5rem' : '16rem')
  }, [collapsed])

  return (
    <>
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
        <Image
          src="/WordmarkWhite.png"
          alt="GymText"
          width={100}
          height={24}
        />
      </div>

      <aside
        className={cn(
          'hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-[hsl(var(--sidebar-bg))] transition-[width] duration-200',
          collapsed ? 'md:w-20' : 'md:w-64'
        )}
      >
        <SidebarContent
          currentPath={pathname}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
        />
      </aside>
    </>
  )
}
