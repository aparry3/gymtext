'use client'

import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type Step = 'choose' | 'upload' | 'generate'

interface SmsImageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  programId: string
  ownerWordmarkUrl: string | null
  programLogoUrl: string | null
  onImageSet: (url: string) => void
}

export function SmsImageDialog({
  open,
  onOpenChange,
  programId,
  ownerWordmarkUrl,
  programLogoUrl,
  onImageSet,
}: SmsImageDialogProps) {
  const [step, setStep] = useState<Step>('choose')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setStep('choose')
    setIsProcessing(false)
    setError(null)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) reset()
    onOpenChange(open)
  }

  const handleDirectUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('File must be an image')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setIsProcessing(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch(`/api/programs/${programId}/image`, {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to upload image')
      }
      onImageSet(result.data.url)
      handleOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGenerate = async (sourceUrl: string) => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await fetch(`/api/programs/${programId}/image/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to generate image')
      }
      onImageSet(result.data.url)
      handleOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLogoUploadAndGenerate = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('File must be an image')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setIsProcessing(true)
    setError(null)
    try {
      // First upload the logo to get a URL, then generate from it
      const formData = new FormData()
      formData.append('file', file)
      // Upload as a temp source — we use the direct upload endpoint but we'll
      // then generate from the returned URL
      const uploadResponse = await fetch(`/api/programs/${programId}/image`, {
        method: 'POST',
        body: formData,
      })
      const uploadResult = await uploadResponse.json()
      if (!uploadResponse.ok || !uploadResult.success) {
        throw new Error(uploadResult.message || 'Failed to upload logo')
      }

      // Now generate from that uploaded URL
      await handleGenerate(uploadResult.data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process logo')
      setIsProcessing(false)
    }
  }

  const hasExistingSources = !!(ownerWordmarkUrl || programLogoUrl)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'choose' && 'Add SMS Image'}
            {step === 'upload' && 'Upload Image'}
            {step === 'generate' && 'Generate from Logo'}
          </DialogTitle>
          <DialogDescription>
            {step === 'choose' && 'Choose how to set the image sent with daily workout texts.'}
            {step === 'upload' && 'Upload the exact image to include with texts.'}
            {step === 'generate' && 'Select or upload a logo to auto-generate a properly sized SMS image.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Step 1: Choose method */}
        {step === 'choose' && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-center group"
              onClick={() => setStep('upload')}
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-blue-500">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">Upload Image</div>
                <div className="text-xs text-gray-400 mt-1">Use a ready-made image</div>
              </div>
            </button>

            <button
              type="button"
              className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-center group"
              onClick={() => setStep('generate')}
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-blue-500">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">Generate from Logo</div>
                <div className="text-xs text-gray-400 mt-1">Auto-create from a wordmark</div>
              </div>
            </button>
          </div>
        )}

        {/* Step 2a: Direct upload */}
        {step === 'upload' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => uploadInputRef.current?.click()}
                disabled={isProcessing}
              >
                {isProcessing ? 'Uploading...' : 'Choose File'}
              </Button>
              <span className="text-xs text-gray-400">Max 5MB, any image format</span>
            </div>

            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleDirectUpload(file)
                e.target.value = ''
              }}
              className="hidden"
            />

            <button
              type="button"
              className="text-sm text-gray-400 hover:text-gray-600"
              onClick={() => { reset(); setStep('choose') }}
            >
              Back
            </button>
          </div>
        )}

        {/* Step 2b: Generate from logo/wordmark */}
        {step === 'generate' && (
          <div className="space-y-4">
            {/* Existing sources */}
            {hasExistingSources && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Use existing</p>
                <div className="space-y-2">
                  {ownerWordmarkUrl && (
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
                      onClick={() => handleGenerate(ownerWordmarkUrl)}
                      disabled={isProcessing}
                    >
                      <img src={ownerWordmarkUrl} alt="" className="h-6 max-w-[100px] object-contain" />
                      <span className="text-sm text-gray-600">Owner Wordmark</span>
                    </button>
                  )}
                  {programLogoUrl && (
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
                      onClick={() => handleGenerate(programLogoUrl)}
                      disabled={isProcessing}
                    >
                      <img src={programLogoUrl} alt="" className="h-6 max-w-[100px] object-contain" />
                      <span className="text-sm text-gray-600">Program Logo</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Upload a new logo */}
            <div className="space-y-2">
              {hasExistingSources && (
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Or upload a logo</p>
              )}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Generating...' : 'Upload Logo'}
                </Button>
                <span className="text-xs text-gray-400">We&apos;ll center it on a white background</span>
              </div>

              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleLogoUploadAndGenerate(file)
                  e.target.value = ''
                }}
                className="hidden"
              />
            </div>

            <button
              type="button"
              className="text-sm text-gray-400 hover:text-gray-600"
              onClick={() => { reset(); setStep('choose') }}
            >
              Back
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
