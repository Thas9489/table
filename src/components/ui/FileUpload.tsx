'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { X, Upload, FileText, File, Loader2, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react'

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
  if (type.startsWith('image/')) return ImageIcon
  if (type === 'application/pdf') return FileText
  return File
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileTypeLabel(type: string): string {
  if (type.startsWith('image/')) return 'Image'
  if (type === 'application/pdf') return 'PDF'
  if (type.includes('word')) return 'Word'
  if (type.includes('excel') || type.includes('spreadsheet')) return 'Excel'
  if (type === 'text/csv') return 'CSV'
  return 'File'
}

export function FileUpload({ value, onChange, className }: FileUploadProps) {
  const [dragging,  setDragging]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fileSize,  setFileSize]  = useState<number | null>(null)
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

    setFileSize(file.size)
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
    setFileSize(null)
    setError(null)
  }

  const isImage = value?.type.startsWith('image/')
  const FileIcon = value ? getFileIcon(value.type) : File

  return (
    <div className={cn('flex flex-col gap-[6px]', className)}>
      <label className="text-[13px] font-medium leading-none" style={{ color: '#1A1A1A' }}>
        Attachment <span className="font-normal" style={{ color: '#9B928B' }}>(Optional)</span>
      </label>

      {value ? (
        /* ── File preview ─────────────────────────────── */
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1.5px solid #E8E0D5', backgroundColor: '#FAF8F5' }}
        >
          {isImage ? (
            /* Image preview */
            <div className="relative">
              <a href={value.url} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value.url}
                  alt={value.name}
                  className="w-full object-cover"
                  style={{ height: '110px' }}
                />
              </a>
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                style={{ backgroundColor: 'rgba(26,26,26,0.55)', color: '#FAF8F5' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(217,107,107,0.85)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(26,26,26,0.55)' }}
              >
                <X size={12} />
              </button>
            </div>
          ) : null}

          {/* File info row */}
          <div className="flex items-center gap-3 px-3 py-2.5">
            {!isImage && (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#F7E8E9' }}
              >
                <FileIcon size={16} style={{ color: '#C4787C' }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-medium truncate" style={{ color: '#1A1A1A' }}>{value.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 size={10} style={{ color: '#5BA68A' }} />
                <span className="text-[11px]" style={{ color: '#9B928B' }}>
                  Uploaded
                  {fileSize ? ` · ${formatBytes(fileSize)}` : ''}
                  {' · '}{getFileTypeLabel(value.type)}
                </span>
              </div>
            </div>
            {!isImage && (
              <button
                type="button"
                onClick={handleRemove}
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
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
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ── Drop zone ─────────────────────────────────── */
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all',
            uploading && 'pointer-events-none opacity-60'
          )}
          style={{
            padding: '20px',
            borderColor: dragging ? '#E8B4B8' : '#D8D0C8',
            backgroundColor: dragging ? '#F7E8E9' : '#FDFCFA',
          }}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 size={20} className="animate-spin" style={{ color: '#C4787C' }} />
              <p className="text-[12px]" style={{ color: '#6B6560' }}>Uploading…</p>
            </div>
          ) : (
            <>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#F0EAE2' }}
              >
                <Upload size={16} style={{ color: '#9B928B' }} />
              </div>
              <div className="text-center">
                <p className="text-[13px]" style={{ color: '#6B6560' }}>
                  <span className="font-semibold" style={{ color: '#C4787C' }}>Click to upload</span>
                  {' '}or drag &amp; drop
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
        <p className="flex items-center gap-1.5 text-[11px]" style={{ color: '#D96B6B' }}>
          <AlertCircle size={11} className="flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
