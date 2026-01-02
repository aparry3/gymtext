import * as React from "react"
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  itemsPerPage?: number
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  itemsPerPage
}: PaginationProps) {
  const pages = generatePaginationItems(currentPage, totalPages)
  
  const startItem = ((currentPage - 1) * (itemsPerPage || 10)) + 1
  const endItem = Math.min(currentPage * (itemsPerPage || 10), totalItems || 0)

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {totalItems && (
        <div className="text-sm text-muted-foreground">
          Showing {startItem}-{endItem} of {totalItems} results
        </div>
      )}
      
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-2">
          {pages.map((item, index) => {
            if (item === '...') {
              return (
                <div key={`ellipsis-${index}`} className="px-2">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              )
            }

            const page = Number(item)
            const isActive = page === currentPage

            return (
              <Button
                key={page}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className="min-w-8"
              >
                {page}
              </Button>
            )
          })}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function generatePaginationItems(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const items: (number | string)[] = []

  // Always show first page
  items.push(1)

  if (currentPage <= 4) {
    // Show pages 2-5 and ellipsis before last
    for (let i = 2; i <= 5; i++) {
      items.push(i)
    }
    items.push('...')
    items.push(totalPages)
  } else if (currentPage >= totalPages - 3) {
    // Show ellipsis after first, then last 4 pages
    items.push('...')
    for (let i = totalPages - 4; i <= totalPages; i++) {
      items.push(i)
    }
  } else {
    // Show ellipsis, current page area, ellipsis
    items.push('...')
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      items.push(i)
    }
    items.push('...')
    items.push(totalPages)
  }

  return items
}

// Simple icons if not available
const ChevronLeft = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
)

const ChevronRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
)

const MoreHorizontal = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
  </svg>
)