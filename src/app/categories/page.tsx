'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCategories } from '@/hooks/useCategories'
import { Plus, Tag, Trash2, Lock } from 'lucide-react'

const PRESET_COLORS = [
  '#E8B4B8', '#D4956A', '#5BA68A', '#D96B6B',
  '#7A9EB5', '#B4A8D4', '#A8C4B8', '#C4A882',
  '#8B6B6B', '#6B8B8B', '#B8A8C4', '#C4B4A8',
]

const CARD_STYLE = {
  backgroundColor: '#FAF8F5',
  border: '1px solid #E8E0D5',
  boxShadow: '0 1px 3px rgba(26,26,26,0.05)',
}

export default function CategoriesPage() {
  const { categories, loading, addCategory, deleteCategory } = useCategories()
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm]       = useState({ name: '', color: '#E8B4B8', icon: 'tag' })
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    const err = await addCategory(form)
    setSaving(false)
    if (err) {
      setError(err.message)
    } else {
      setAddOpen(false)
      setForm({ name: '', color: '#E8B4B8', icon: 'tag' })
      setError('')
    }
  }

  const defaults = categories.filter(c => c.is_default)
  const custom   = categories.filter(c => !c.is_default)

  return (
    <AppLayout title="Categories" subtitle="Manage your transaction categories">
      <div className="flex justify-end mb-5">
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={13} /> New Category
        </Button>
      </div>

      {/* Default categories */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={11} style={{ color: '#9B928B' }} />
          <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#9B928B', letterSpacing: '0.07em' }}>
            Default Categories
          </h3>
        </div>
        {loading ? (
          <div className="text-[13px] py-4" style={{ color: '#9B928B' }}>Loading…</div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {defaults.map(cat => (
              <div
                key={cat.id}
                className="rounded-2xl px-4 py-3.5 flex items-center gap-3 min-w-0"
                style={CARD_STYLE}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${cat.color}20` }}
                >
                  <Tag size={14} style={{ color: cat.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: '#1A1A1A' }}>{cat.name}</p>
                  <p className="text-[11px]" style={{ color: '#9B928B' }}>Default</p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom categories */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Tag size={11} style={{ color: '#9B928B' }} />
          <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#9B928B', letterSpacing: '0.07em' }}>
            Custom Categories {custom.length > 0 && `(${custom.length})`}
          </h3>
        </div>
        {custom.length === 0 ? (
          <div
            className="rounded-2xl py-12 text-center"
            style={{ ...CARD_STYLE, border: '1px dashed #D8D0C8' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: '#F0EAE2' }}
            >
              <Tag size={16} style={{ color: '#D4C8BC' }} />
            </div>
            <p className="text-[13px] mb-3" style={{ color: '#9B928B' }}>No custom categories yet</p>
            <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
              <Plus size={13} /> Create Category
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {custom.map(cat => (
              <div
                key={cat.id}
                className="rounded-2xl px-4 py-3.5 flex items-center gap-3 group min-w-0"
                style={CARD_STYLE}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${cat.color}20` }}
                >
                  <Tag size={14} style={{ color: cat.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: '#1A1A1A' }}>{cat.name}</p>
                  <p className="text-[11px]" style={{ color: '#9B928B' }}>Custom</p>
                </div>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
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
            ))}
          </div>
        )}
      </div>

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Category" size="sm">
        <form onSubmit={handleAdd} className="space-y-5">
          <Input
            label="Category Name"
            placeholder="e.g. Subscriptions"
            value={form.name}
            onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError('') }}
            error={error}
          />

          <div>
            <label className="text-[13px] font-medium block mb-2.5" style={{ color: '#1A1A1A' }}>Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="w-8 h-8 rounded-xl transition-all"
                  style={{
                    background: c,
                    transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
                    outline: form.color === c ? `2.5px solid ${c}` : 'none',
                    outlineOffset: form.color === c ? '3px' : '0',
                    boxShadow: form.color === c ? `0 2px 8px ${c}60` : 'none',
                  }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => { setAddOpen(false); setError('') }}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={saving}>
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}
