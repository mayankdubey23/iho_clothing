import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Tags, Trash2, X } from 'lucide-react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

const inputCls = 'w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

function ModalWrapper({ children, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function Categories({ categories }) {
  // ── Create ─────────────────────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const { data, setData, post, processing, reset, errors } = useForm({
    name: '', slug: '', is_active: true,
  });
  function submitCreate(e) {
    e.preventDefault();
    post('/admin/categories', { onSuccess: () => { setShowCreate(false); reset(); } });
  }

  // ── Edit ───────────────────────────────────────────────────────────────────
  const [editCategory, setEditCategory] = useState(null);
  const {
    data: editData, setData: setEditData,
    patch: patchCategory, processing: editProcessing,
    reset: resetEdit, errors: editErrors,
  } = useForm({ name: '', slug: '', is_active: true });

  function openEdit(category) {
    setEditCategory(category);
    setEditData({ name: category.name, slug: category.slug, is_active: category.is_active });
  }

  function deleteCategory(category) {
    if (!confirm(`Delete "${category.name}"? Products assigned to this category will become uncategorized.`)) return;
    router.delete(`/admin/categories/${category.id}`, { preserveScroll: true });
  }
  function submitEdit(e) {
    e.preventDefault();
    patchCategory(`/admin/categories/${editCategory.id}`, {
      onSuccess: () => { setEditCategory(null); resetEdit(); },
    });
  }

  return (
    <AdminLayout active="categories">
      <Head title="Categories | Admin" />

      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-black text-slate-900">Categories</h1>
          <p className="mt-1 text-sm font-medium text-slate-400">Manage clothing categories.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Table */}
      <div className="max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-slate-100">
              <Tags size={28} className="text-slate-400" />
            </div>
            <p className="font-semibold text-slate-500">No categories yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  {['Category Name', 'Slug', 'Total Products', ''].map((h) => (
                    <th key={h} className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {categories.map((category) => (
                  <tr key={category.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-lg bg-slate-100">
                          <Tags size={15} className="text-slate-400" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900">{category.name}</span>
                          <p className="text-xs text-slate-400">
                            {category.is_active
                              ? <span className="text-emerald-600">● Active</span>
                              : <span className="text-slate-400">○ Inactive</span>
                            }
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-sm text-slate-500">
                        {category.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-blue-600">{category.products_count || 0}</span>
                      <span className="ml-1 text-sm text-slate-400">products</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(category)}
                          className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
                          title="Edit category"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteCategory(category)}
                          className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Delete category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══ CREATE CATEGORY MODAL ══ */}
      <AnimatePresence>
        {showCreate && (
          <ModalWrapper onClose={() => setShowCreate(false)}>
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4">
              <h3 className="text-base font-black text-white">Add Category</h3>
              <button onClick={() => setShowCreate(false)} className="rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitCreate} className="grid gap-5 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">Name</label>
                <input required className={inputCls} placeholder="e.g. Premium T-Shirts" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                {errors.name && <p className="mt-1 text-xs font-medium text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">Slug</label>
                <input required className={`${inputCls} font-mono`} placeholder="premium-t-shirts" value={data.slug} onChange={(e) => setData('slug', e.target.value)} />
                {errors.slug && <p className="mt-1 text-xs font-medium text-red-500">{errors.slug}</p>}
              </div>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-slate-700">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-blue-600" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                Active (visible on storefront)
              </label>
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={processing} className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-60">
                  {processing ? 'Saving…' : 'Save Category'}
                </button>
              </div>
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* ══ EDIT CATEGORY MODAL ══ */}
      <AnimatePresence>
        {editCategory && (
          <ModalWrapper onClose={() => setEditCategory(null)}>
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4">
              <h3 className="text-base font-black text-white">Edit — {editCategory.name}</h3>
              <button onClick={() => setEditCategory(null)} className="rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitEdit} className="grid gap-5 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">Name</label>
                <input required className={inputCls} value={editData.name} onChange={(e) => setEditData('name', e.target.value)} />
                {editErrors.name && <p className="mt-1 text-xs font-medium text-red-500">{editErrors.name}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">Slug</label>
                <input required className={`${inputCls} font-mono`} value={editData.slug} onChange={(e) => setEditData('slug', e.target.value)} />
                {editErrors.slug && <p className="mt-1 text-xs font-medium text-red-500">{editErrors.slug}</p>}
              </div>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-slate-700">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-blue-600" checked={editData.is_active} onChange={(e) => setEditData('is_active', e.target.checked)} />
                Active (visible on storefront)
              </label>
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setEditCategory(null)} className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={editProcessing} className="rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 disabled:opacity-60">
                  {editProcessing ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
