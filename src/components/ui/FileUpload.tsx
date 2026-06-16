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
      <label className="text-sm font-medium text-slate-700 leading-none">Attachment</label>

      {value ? (
        /* File preview */
        <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg group">
          {isImage ? (
            <a href={value.url} target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value.url} alt={value.name} className="w-full h-full object-cover" />
            </a>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
              <FileIcon size={18} className="text-indigo-500" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <a
              href={value.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-700 hover:text-slate-900 truncate block transition-colors"
            >
              {value.name}
            </a>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 size={10} className="text-emerald-500" />
              Uploaded successfully
            </p>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
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
            'relative flex flex-col items-center justify-center gap-2 p-5 rounded-lg border-2 border-dashed cursor-pointer transition-all',
            dragging
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50',
            uploading && 'pointer-events-none opacity-60'
          )}
        >
          {uploading ? (
            <>
              <Loader2 size={22} className="text-indigo-500 animate-spin" />
              <p className="text-xs text-slate-500">Uploading…</p>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                <Upload size={16} className="text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  <span className="text-indigo-600 font-medium">Click to upload</span> or drag & drop
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
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
        <p className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
}
