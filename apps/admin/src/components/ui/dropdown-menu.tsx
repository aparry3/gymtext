"use client"

import * as React from "react"

interface DropdownMenuProps {
  children: React.ReactNode
}

interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null)

function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

interface DropdownMenuTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

function DropdownMenuTrigger({ asChild, children }: DropdownMenuTriggerProps) {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu")

  const handleClick = () => {
    context.setOpen(!context.open)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: handleClick,
    })
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  )
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  align?: "start" | "center" | "end"
  className?: string
}

function DropdownMenuContent({ children, align = "end", className = "" }: DropdownMenuContentProps) {
  const context = React.useContext(DropdownMenuContext)
  const ref = React.useRef<HTMLDivElement>(null)

  if (!context) throw new Error("DropdownMenuContent must be used within DropdownMenu")

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        // Check if click was on the trigger
        const parent = ref.current.parentElement
        if (parent && !parent.contains(event.target as Node)) {
          context.setOpen(false)
        } else if (parent) {
          // Check if click was outside the dropdown but inside parent
          const trigger = parent.querySelector('[role="button"], button')
          if (trigger && !trigger.contains(event.target as Node)) {
            context.setOpen(false)
          }
        }
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        context.setOpen(false)
      }
    }

    if (context.open) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [context.open, context])

  if (!context.open) return null

  const alignmentClass = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }[align]

  return (
    <div
      ref={ref}
      className={`
        absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-xl
        border border-gray-200 bg-white p-1 shadow-lg
        animate-in fade-in-0 zoom-in-95
        ${alignmentClass}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

function DropdownMenuItem({ children, onClick, disabled, className = "" }: DropdownMenuItemProps) {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error("DropdownMenuItem must be used within DropdownMenu")

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick()
      context.setOpen(false)
    }
  }

  return (
    <button
      type="button"
      className={`
        relative flex w-full cursor-pointer select-none items-center rounded-lg
        px-3 py-2 text-sm text-gray-700 outline-none
        transition-colors hover:bg-gray-100 hover:text-gray-900
        focus:bg-gray-100 focus:text-gray-900
        ${disabled ? "pointer-events-none opacity-50" : ""}
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

function DropdownMenuSeparator() {
  return <div className="-mx-1 my-1 h-px bg-gray-200" />
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
