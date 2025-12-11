import * as React from "react"

export interface PopoverProps {
  children: React.ReactNode
}

export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  asChild?: boolean
}

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
}

const PopoverContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({ open: false, setOpen: () => {} })

const Popover = ({ children }: PopoverProps) => {
  const [open, setOpen] = React.useState(false)
  
  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ className = "", onClick, asChild = false, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(PopoverContext)
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(!open)
      onClick?.(e)
    }
    
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          handleClick(e)
          const childProps = children.props as React.ButtonHTMLAttributes<HTMLButtonElement>
          childProps.onClick?.(e)
        }
      } as React.HTMLAttributes<HTMLElement>)
    }
    
    return (
      <button
        ref={ref}
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className = "", align = 'center', side = 'bottom', children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(PopoverContext)
    const contentRef = React.useRef<HTMLDivElement>(null)
    
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
          setOpen(false)
        }
      }
      
      if (open) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [open, setOpen])
    
    if (!open) return null
    
    const sideClasses = {
      top: 'bottom-full mb-2',
      right: 'left-full ml-2 top-0',
      bottom: 'top-full mt-2',
      left: 'right-full mr-2 top-0'
    }
    
    const alignClasses = {
      start: side === 'top' || side === 'bottom' ? 'left-0' : 'top-0',
      center: side === 'top' || side === 'bottom' ? 'left-1/2 transform -translate-x-1/2' : 'top-1/2 transform -translate-y-1/2',
      end: side === 'top' || side === 'bottom' ? 'right-0' : 'bottom-0'
    }
    
    return (
      <div
        ref={(element) => {
          contentRef.current = element
          if (typeof ref === 'function') {
            ref(element)
          } else if (ref) {
            ref.current = element
          }
        }}
        className={`absolute z-50 min-w-[8rem] rounded-md border bg-white p-4 text-foreground shadow-md ${sideClasses[side]} ${alignClasses[align]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }