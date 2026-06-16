'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCategories } from '@/hooks/useCategories'
import { Plus, Tag, Trash2, Lock } from 'lucide-react'

const PRESET_COLORS = [
  '#6366f1', '#3b82f6', '#059669', '#dc2626',
  '#d97706', '#ec4899', '#06b6d4', '#8b5cf6',
  '#10b981', '#f97316', '#64748b', '#a855f7',
]

export default function CategoriesPage() {
  const { categories, loading, addCategory, deleteCategory } = useCategories()
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm]       = useState({ name: '', color: '#6366f1', icon: 'tag' })
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
      setForm({ name: '', color: '#6366f1', icon: 'tag' })
      setError('')
    }
  }

  const defaults = categories.filter(c => c.is_default)
  const custom   = categories.filter(c => !c.is_default)

  return (
    <AppLayout title="Categories" subtitle="Manage your transaction categories">
      <div className="flex justify-end mb-6">
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={15} /> New Category
        </Button>
      </div>

      {/* Default categories */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={12} className="text-slate-400" />
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Default Categories
          </h3>
        </div>
        {loading ? (
          <div className="text-slate-400 text-sm py-4">Loading…</div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {defaults.map(cat => (
              <div
                key={cat.id}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 flex items-center gap-3 shadow-sm"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${cat.color}14` }}
                >
                  <Tag size={15} style={{ color: cat.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{cat.name}</p>
                  <p className="text-[11px] text-slate-400">Default</p>
                </div>
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom categories */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Tag size={12} className="text-slate-400" />
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Custom Categories {custom.length > 0 && `(${custom.length})`}
          </h3>
        </div>
        {custom.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Tag size={18} className="text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm mb-3">No custom categories yet</p>
            <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
              <Plus size={14} /> Create Category
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {custom.map(cat => (
              <div
                key={cat.id}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 flex items-center gap-3 shadow-sm group"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${cat.color}14` }}
                >
                  <Tag size={15} style={{ color: cat.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{cat.name}</p>
                  <p className="text-[11px] text-slate-400">Custom</p>
                </div>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Delete"
                >
                  <Trash2 size={14} />
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
            placeholder="e.g. Groceries"
            value={form.name}
            onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError('') }}
            error={error}
          />

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-lg transition-all ${
                    form.color === c
                      ? 'scale-125 ring-2 ring-offset-1 ring-slate-400'
                      : 'hover:scale-110'
                  }`}
                  style={{ background: c }}
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
