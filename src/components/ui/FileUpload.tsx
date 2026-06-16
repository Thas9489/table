'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Paperclip, X, Upload, FileText, Image, File, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface UploadedFile {
  url: string
  name: string
  type: string
}

interface FileUploadProps {
  value?: UploadedFile | null
  onChange: (file: UploadedFile | null) => void
  className?: string
}

const ACCEPTED = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
]
const MAX_SIZE = 10 * 1024 * 1024

function getFileIcon(type: string) {
  if (type.startsWith('image/'))     return Image
  if (type === 'application/pdf')    return FileText
  return File
}

function formatBytes(bytes: number) {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUpload({ value, onChange, className }: FileUploadProps) {
  const [dragging,  setDragging]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    setError(null)
    if (!ACCEPTED.includes(file.type)) {
      setError('File type not supported. Use images, PDF, Word, Excel, or CSV.')
      return
    }
    if (file.size > MAX_SIZE) {
      setError(`File too large. Max 10 MB (got ${formatBytes(file.size)}).`)
      return
    }

    setUploading(true)
    const supabase = createClient()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`

    const { error: uploadErr } = await supabase.storage
      .from('budget-attach')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (uploadErr) {
      setError(`Upload failed: ${uploadErr.message}`)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('budget-attach').getPublicUrl(path)
    onChange({ url: data.publicUrl, name: file.name, type: file.type })
    setUploading(false)
  }

  const handleFiles = (files: FileList | null) => {
    if (files?.[0]) upload(files[0])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleRemove = async () => {
    if (!value) return
    const supabase = createClient()
    const urlParts = value.url.split('/budget-attach/')
    if (urlParts[1]) {
      await supabase.storage.from('budget-attach').remove([urlParts[1]])
    }
    onChange(null)
    setError(null)
  }

  const isImage  = value?.type.startsWith('image/')
  const FileIcon = value ? getFileIcon(value.type) : Paperclip

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-sm font-medium leading-none" style={{ color: '#1A1A1A' }}>Attachment</label>

      {value ? (
        /* File preview */
        <div
          className="flex items-center gap-3 p-3 rounded-xl group"
          style={{ backgroundColor: '#FAF8F5', border: '1px solid #E8E0D5' }}
        >
          {isImage ? (
            <a href={value.url} target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
              style={{ border: '1px solid #E8E0D5' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value.url} alt={value.name} className="w-full h-full object-cover" />
            </a>
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#F7E8E9', border: '1px solid #F0D8DA' }}
            >
              <FileIcon size={18} style={{ color: '#C4787C' }} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <a
              href={value.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm truncate block transition-colors"
              style={{ color: '#1A1A1A' }}
            >
              {value.name}
            </a>
            <p className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: '#9B928B' }}>
              <CheckCircle2 size={10} style={{ color: '#5BA68A' }} />
              Uploaded successfully
            </p>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            style={{ color: '#9B928B' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#FBF0F0'
              ;(e.currentTarget as HTMLElement).style.color = '#D96B6B'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = '#9B928B'
            }}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        /* Drop zone */
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'relative flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all',
            uploading && 'pointer-events-none opacity-60'
          )}
          style={{
            borderColor: dragging ? '#E8B4B8' : '#E8E0D5',
            backgroundColor: dragging ? '#F7E8E9' : '#FAF8F5',
          }}
        >
          {uploading ? (
            <>
              <Loader2 size={22} className="animate-spin" style={{ color: '#C4787C' }} />
              <p className="text-xs" style={{ color: '#6B6560' }}>Uploading…</p>
            </>
          ) : (
            <>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#F0EAE2', border: '1px solid #E8E0D5' }}
              >
                <Upload size={16} style={{ color: '#9B928B' }} />
              </div>
              <div className="text-center">
                <p className="text-sm" style={{ color: '#6B6560' }}>
                  <span className="font-medium" style={{ color: '#C4787C' }}>Click to upload</span> or drag &amp; drop
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: '#9B928B' }}>
                  Images, PDF, Word, Excel, CSV · Max 10 MB
                </p>
              </div>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={ACCEPTED.join(',')}
            onChange={e => handleFiles(e.target.files)}
          />
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-xs" style={{ color: '#D96B6B' }}>
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
}
