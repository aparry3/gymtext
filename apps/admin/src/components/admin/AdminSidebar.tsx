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
  ChevronDown,
  LogOut,
  Building2,
  Landmark,
  ClipboardList,
  Dumbbell,
  Bot,
  ScrollText,
  ArrowUpCircle,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEnvironment } from '@/context/EnvironmentContext'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/exercises', label: 'Exercises', icon: Dumbbell },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/demos', label: 'Demos', icon: Presentation },
]

const programItems = [
  { href: '/programs', label: 'Programs', icon: ClipboardList },
  { href: '/program-owners', label: 'Owners & Coaches', icon: Building2 },
  { href: '/organizations', label: 'Organizations', icon: Landmark },
]

const devAdminItems = [
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/agent-logs', label: 'Agent Logs', icon: ScrollText },
  { href: '/registry', label: 'Tool Registry', icon: FileText },
  { href: '/promote', label: 'Deploy', icon: ArrowUpCircle },
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

const PROGRAMS_STORAGE_KEY = 'admin-programs-open'

function ProgramsSection({
  currentPath,
  collapsed,
  onNavClick,
}: {
  currentPath: string
  collapsed?: boolean
  onNavClick?: () => void
}) {
  const [open, setOpen] = useState(false)
  const isActive = programItems.some((item) => currentPath.startsWith(item.href))

  useEffect(() => {
    const stored = window.localStorage.getItem(PROGRAMS_STORAGE_KEY)
    if (stored === 'true') setOpen(true)
  }, [])

  useEffect(() => {
    if (isActive) setOpen(true)
  }, [isActive])

  const toggle = () => {
    setOpen((prev) => {
      window.localStorage.setItem(PROGRAMS_STORAGE_KEY, (!prev).toString())
      return !prev
    })
  }

  if (collapsed) {
    return (
      <>
        {programItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            collapsed
            isActive={currentPath.startsWith(item.href)}
            onClick={onNavClick}
          />
        ))}
      </>
    )
  }

  return (
    <div>
      <button
        onClick={toggle}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'text-white'
            : 'text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-muted))]'
        )}
      >
        <ClipboardList className="h-5 w-5" />
        <span className="flex-1 text-left">Programs</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            open ? 'rotate-0' : '-rotate-90'
          )}
        />
      </button>
      {open && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-[hsl(var(--sidebar-border))] pl-2">
          {programItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={currentPath.startsWith(item.href)}
              onClick={onNavClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const DEV_ADMIN_STORAGE_KEY = 'admin-dev-section-open'

function DevAdminSection({
  currentPath,
  collapsed,
  onNavClick,
}: {
  currentPath: string
  collapsed?: boolean
  onNavClick?: () => void
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(DEV_ADMIN_STORAGE_KEY)
    if (stored === 'true') setOpen(true)
  }, [])

  const toggle = () => {
    setOpen((prev) => {
      window.localStorage.setItem(DEV_ADMIN_STORAGE_KEY, (!prev).toString())
      return !prev
    })
  }

  // Auto-expand if current path matches a dev admin item
  useEffect(() => {
    if (devAdminItems.some((item) => currentPath.startsWith(item.href))) {
      setOpen(true)
    }
  }, [currentPath])

  if (collapsed) {
    return (
      <>
        <div className="my-2 border-t border-[hsl(var(--sidebar-border))]" />
        {devAdminItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            collapsed
            isActive={currentPath.startsWith(item.href)}
            onClick={onNavClick}
          />
        ))}
      </>
    )
  }

  return (
    <div className="mt-2">
      <button
        onClick={toggle}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-foreground))]/50 hover:bg-[hsl(var(--sidebar-muted))] transition-colors"
      >
        <Wrench className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Dev Admin</span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200',
            open ? 'rotate-0' : '-rotate-90'
          )}
        />
      </button>
      {open && (
        <div className="mt-1 space-y-1">
          {devAdminItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={currentPath.startsWith(item.href)}
              onClick={onNavClick}
            />
          ))}
        </div>
      )}
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

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Home + Users */}
        {navItems.slice(0, 2).map((item) => (
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

        <ProgramsSection
          currentPath={currentPath}
          collapsed={collapsed}
          onNavClick={onNavClick}
        />

        {/* Exercises, Messages, Calendar, Demos */}
        {navItems.slice(2).map((item) => (
          <NavItem
            key={item.href}
            {...item}
            collapsed={collapsed}
            isActive={currentPath.startsWith(item.href)}
            onClick={onNavClick}
          />
        ))}

        <DevAdminSection
          currentPath={currentPath}
          collapsed={collapsed}
          onNavClick={onNavClick}
        />
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
