'use client'

interface StreamingMessageProps {
  content: string
}

export default function StreamingMessage({ content }: StreamingMessageProps) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[70%] rounded-lg px-4 py-2 bg-gray-100 text-gray-900">
        <p className="whitespace-pre-wrap break-words">{content}</p>
        <div className="inline-block w-1 h-4 bg-gray-600 animate-pulse ml-1" />
      </div>
    </div>
  )
}