'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'
import { FileUploader, ParseResult } from '@/components/admin/programs/FileUploader'
import { TextPreview } from '@/components/admin/programs/TextPreview'

export default function FileUploadPage() {
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/programs">Programs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>File Parser</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-2">File Parser</h1>
          <p className="text-muted-foreground mb-6">
            Upload a document to extract text content for program setup.
          </p>
          <FileUploader onParseComplete={setParseResult} />
        </Card>

        {parseResult && parseResult.success && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Extracted Text</h2>
            <TextPreview
              result={parseResult}
              onClear={() => setParseResult(null)}
            />
          </Card>
        )}
      </div>
    </div>
  )
}
