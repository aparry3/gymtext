import * as React from "react"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className = "", size = 'md', ...props }, ref) => {
    const sizes = {
      sm: "h-8 w-8",
      md: "h-10 w-10", 
      lg: "h-12 w-12"
    }

    return (
      <div
        ref={ref}
        className={`relative flex shrink-0 overflow-hidden rounded-full ${sizes[size]} ${className}`}
        {...props}
      />
    )
  }
)
Avatar.displayName = "Avatar"

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt?: string
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={ref}
          className={`aspect-square h-full w-full object-cover ${className}`}
          alt=""
          {...props}
        />
      </>
    )
  }
)
AvatarImage.displayName = "AvatarImage"

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium ${className}`}
        {...props}
      />
    )
  }
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }