import * as React from "react"
import Link from "next/link"

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={className}
        {...props}
      />
    )
  }
)
Breadcrumb.displayName = "Breadcrumb"

export interface BreadcrumbListProps extends React.HTMLAttributes<HTMLOListElement> {
  children?: React.ReactNode
}

const BreadcrumbList = React.forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <ol
        ref={ref}
        className={`flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5 ${className}`}
        {...props}
      />
    )
  }
)
BreadcrumbList.displayName = "BreadcrumbList"

export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children?: React.ReactNode
}

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={`inline-flex items-center gap-1.5 ${className}`}
        {...props}
      />
    )
  }
)
BreadcrumbItem.displayName = "BreadcrumbItem"

export interface BreadcrumbLinkProps extends React.ComponentProps<typeof Link> {
  children?: React.ReactNode
}

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <Link
        ref={ref}
        className={`transition-colors hover:text-foreground ${className}`}
        {...props}
      />
    )
  }
)
BreadcrumbLink.displayName = "BreadcrumbLink"

export interface BreadcrumbPageProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
}

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <span
        ref={ref}
        role="link"
        aria-disabled="true"
        aria-current="page"
        className={`font-normal text-foreground ${className}`}
        {...props}
      />
    )
  }
)
BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbSeparator = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLLIElement>) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={`[&>svg]:size-3.5 ${className}`}
    {...props}
  >
    {children ?? <ChevronRightIcon />}
  </li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

// Simple chevron right icon
const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
)

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
}