'use client'
import { useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { TransactionForm } from './TransactionForm'
import type { Transaction } from '@/lib/supabase/types'
import { Pencil, Trash2, TrendingUp, TrendingDown, Paperclip, ImageIcon } from 'lucide-react'

interface TransactionCardProps {
  transaction: Transaction
  onUpdate: (id: string, data: Partial<Transaction>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function TransactionCard({ transaction, onUpdate, onDelete }: TransactionCardProps) {
  const [editOpen,   setEditOpen]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  const isIncome        = transaction.type === 'income'
  const cat             = transaction.categories
  const hasAttachment   = !!transaction.attachment_url
  const isImageAttach   = transaction.attachment_type?.startsWith('image/')

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(transaction.id)
    setDeleting(false)
    setDeleteOpen(false)
  }

  return (
    <>
      <div
        className="flex items-center gap-4 px-5 py-[14px] transition-colors group cursor-default"
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F8F4EF' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
      >
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: cat?.color ? `${cat.color}18` : (isIncome ? '#EBF5F1' : '#FBF0F0') }}
        >
          {isIncome
            ? <TrendingUp  size={15} style={{ color: cat?.color ?? '#5BA68A' }} />
            : <TrendingDown size={15} style={{ color: cat?.color ?? '#D96B6B' }} />
          }
        </div>

        {/* Description & meta */}
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-medium truncate leading-snug" style={{ color: '#1A1A1A' }}>
            {transaction.description || 'Untitled'}
          </p>
          <div className="flex items-center gap-2 mt-[3px] flex-wrap">
            <span className="text-[11px]" style={{ color: '#9B928B' }}>{formatDate(transaction.date)}</span>
            {cat && <Badge color={cat.color}>{cat.name}</Badge>}
            {hasAttachment && (
              <a
                href={transaction.attachment_url!}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-[11px] transition-colors"
                style={{ color: '#C4787C' }}
                title={transaction.attachment_name ?? 'Attachment'}
              >
                {isImageAttach ? <ImageIcon size={11} /> : <Paperclip size={11} />}
                <span className="max-w-[80px] truncate">{transaction.attachment_name}</span>
              </a>
            )}
          </div>
        </div>

        {/* Image thumbnail */}
        {isImageAttach && transaction.attachment_url && (
          <a
            href={transaction.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex-shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={transaction.attachment_url}
              alt={transaction.attachment_name ?? ''}
              className="w-9 h-9 rounded-lg object-cover"
              style={{ border: '1px solid #E8E0D5' }}
            />
          </a>
        )}

        {/* Amount */}
        <div className="text-right flex-shrink-0 min-w-[80px]">
          <p className="text-[14px] font-semibold" style={{ color: isIncome ? '#5BA68A' : '#D96B6B' }}>
            {isIncome ? '+' : '−'}{formatCurrency(transaction.amount)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => setEditOpen(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: '#9B928B' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EAE2'
              ;(e.currentTarget as HTMLElement).style.color = '#1A1A1A'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = '#9B928B'
            }}
            title="Edit"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: '#9B928B' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#FBF0F0'
              ;(e.currentTarget as HTMLElement).style.color = '#D96B6B'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = '#9B928B'
            }}
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Transaction">
        <TransactionForm
          initial={transaction}
          onSubmit={async (data) => { await onUpdate(transaction.id, data); setEditOpen(false) }}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Transaction" size="sm">
        <div className="space-y-5">
          <p className="text-[13.5px] leading-relaxed" style={{ color: '#6B6560' }}>
            Delete{' '}
            <span className="font-semibold" style={{ color: '#1A1A1A' }}>
              {transaction.description || 'this transaction'}
            </span>
            ? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteOpen(false)}
              className="flex-1 h-9 rounded-xl text-[13.5px] font-medium transition-all"
              style={{ border: '1px solid #E8E0D5', color: '#6B6560', backgroundColor: '#FAF8F5' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F0EAE2' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FAF8F5' }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 h-9 rounded-xl text-[13.5px] font-medium transition-all disabled:opacity-50"
              style={{ backgroundColor: '#FBF0F0', border: '1px solid #F5CECE', color: '#D96B6B' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F5DADA' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FBF0F0' }}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
