import React, { useMemo, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Eye,
  EyeOff,
  FolderTree,
  Layers3,
  Package,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Categories({ categories, parentCategories = [], stats, filters, capabilities = {} }) {
  const safeCategories = categories?.data || [];
  const [search, setSearch] = useState(filters?.search || '');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    parent_id: '',
    description: '',
    image: null,
    banner: null,
  });

  const groupedCategories = useMemo(() => {
    const parents = safeCategories.filter((category) => !category.parent_id);
    const children = safeCategories.filter((category) => category.parent_id);

    return { parents, children };
  }, [safeCategories]);

  const submit = (e) => {
    e.preventDefault();
    post('/franchise-superadmin/categories', {
      forceFormData: true,
      onSuccess: () => {
        setIsAddModalOpen(false);
        reset();
      },
    });
  };

  const toggleStatus = (id) => {
    router.post(`/franchise-superadmin/categories/${id}/toggle-status`, {}, { preserveScroll: true });
  };

  const syncDefaults = () => {
    router.post('/franchise-superadmin/categories/sync-defaults', {}, { preserveScroll: true });
  };

  const runSearch = () => {
    router.get('/franchise-superadmin/categories', { search }, { preserveState: true, preserveScroll: true });
  };

  return (
    <AdminLayout active="categories">
      <Head title="Categories | Super Admin" />

      <div className="mx-auto max-w-[1600px] px-4 pb-20 pt-6 sm:px-6">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Storefront Taxonomy</p>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-black uppercase tracking-tight text-[#282c3f]">
              <Layers3 className="text-[#ff3f6c]" /> Collections
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-bold text-slate-500">
              These categories power the website navigation, shop filters, and product assignment in the super-admin product form.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={syncDefaults}
              className="flex items-center justify-center gap-2 border border-slate-200 bg-white px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#282c3f] transition-colors hover:border-[#282c3f]"
            >
              <RefreshCw size={15} /> Sync Storefront Defaults
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#282c3f] px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-black/10 transition-colors hover:bg-[#ff3f6c]"
            >
              <Plus size={16} /> New Collection
            </button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard title="Main Collections" value={stats?.total_categories} icon={Layers3} color="text-blue-500" />
          <StatCard title="Sub Collections" value={stats?.total_subcategories} icon={FolderTree} color="text-purple-500" />
          <StatCard title="Active Categories" value={stats?.active_categories} icon={Eye} color="text-green-500" />
        </div>

        <div className="mb-8 border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              className="w-full border-0 bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold text-[#282c3f] outline-none ring-0 placeholder:text-slate-400 focus:ring-1 focus:ring-[#282c3f]"
            />
          </div>
        </div>

        {safeCategories.length > 0 ? (
          <div className="space-y-8">
            <CategorySection
              title="Main Website Collections"
              description="Navbar and top-level shop filter groups."
              categories={groupedCategories.parents}
              onToggle={toggleStatus}
            />
            <CategorySection
              title="Sub Collections"
              description="Nested filters used under Men, Women, Gym Wear, Running Wear and other collections."
              categories={groupedCategories.children}
              onToggle={toggleStatus}
            />
          </div>
        ) : (
          <div className="border border-dashed border-slate-200 bg-white py-20 text-center">
            <Layers3 size={42} className="mx-auto mb-4 text-slate-300" strokeWidth={1.5} />
            <p className="text-lg font-black uppercase tracking-tight text-[#282c3f]">No Categories Found</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">Sync defaults or create your first storefront collection.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#282c3f]/70 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-slate-200 bg-white shadow-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 p-6 backdrop-blur">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400">Storefront Category</p>
                  <h3 className="mt-1 text-lg font-black uppercase tracking-tight text-[#282c3f]">Create Collection</h3>
                </div>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-red-500">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={submit} className="space-y-6 p-6">
                <FormField label="Category Name" error={errors.name} required>
                  <input
                    type="text"
                    required
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="form-input"
                    placeholder="e.g. Men Sportswear, Men T-Shirts"
                  />
                </FormField>

                {capabilities.parent_id && (
                  <FormField label="Parent Collection" error={errors.parent_id}>
                    <select value={data.parent_id} onChange={(e) => setData('parent_id', e.target.value)} className="form-input cursor-pointer">
                      <option value="">Main collection</option>
                      {parentCategories.map((parent) => (
                        <option key={parent.id} value={parent.id}>{parent.name}</option>
                      ))}
                    </select>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Choose a parent only when creating a sub collection.
                    </p>
                  </FormField>
                )}

                {capabilities.description && (
                  <FormField label="Description" error={errors.description}>
                    <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows="3" className="form-input resize-none" />
                  </FormField>
                )}

                {(capabilities.image || capabilities.banner) && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {capabilities.image && (
                      <UploadField label="Square Icon" file={data.image} onChange={(file) => setData('image', file)} />
                    )}
                    {capabilities.banner && (
                      <UploadField label="Wide Banner" file={data.banner} onChange={(file) => setData('banner', file)} />
                    )}
                  </div>
                )}

                <button disabled={processing} type="submit" className="w-full bg-[#282c3f] py-4 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[#ff3f6c] disabled:opacity-50">
                  {processing ? 'Saving...' : 'Save Category'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .form-input {
          width: 100%;
          background: #f5f5f6;
          border: 1px solid #fff0f4;
          padding: 0.9rem 1rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: #282c3f;
          outline: none;
        }
        .form-input:focus {
          border-color: #282c3f;
          background: #ffffff;
          box-shadow: 0 0 0 1px #282c3f;
        }
      `}</style>
    </AdminLayout>
  );
}

function CategorySection({ title, description, categories, onToggle }) {
  return (
    <section>
      <div className="mb-4 flex flex-col gap-1 border-b border-slate-200 pb-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-[#282c3f]">{title}</h2>
        <p className="text-xs font-bold text-slate-500">{description}</p>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} onToggle={onToggle} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-slate-200 bg-white p-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
          No records in this group.
        </div>
      )}
    </section>
  );
}

function CategoryCard({ category, onToggle }) {
  const isActive = category.status === 'active' || category.is_active === true || category.is_active === 1;
  const isSubCategory = Boolean(category.parent_id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#282c3f]"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
            {isSubCategory ? 'Sub Collection' : 'Main Collection'}
          </p>
          <h3 className="text-xl font-black uppercase tracking-tight text-[#282c3f]">{category.name}</h3>
          {category.parent && (
            <p className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {category.parent.name} <ChevronRight size={12} /> {category.name}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onToggle(category.id)}
          className={`grid size-10 place-items-center border transition-colors ${isActive ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-red-100 bg-red-50 text-red-500'}`}
          title={isActive ? 'Deactivate' : 'Activate'}
        >
          {isActive ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <Link href={`/shop?category=${category.slug}`} className="border border-slate-200 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:border-[#282c3f] hover:text-[#282c3f]">
          View on site
        </Link>
        <span className={`border px-3 py-2 text-[9px] font-black uppercase tracking-widest ${isActive ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-red-100 bg-red-50 text-red-600'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
        <CountPill icon={FolderTree} label="Subcats" value={category.sub_categories_count || category.children_count || 0} />
        <CountPill icon={Package} label="Products" value={category.products_count || 0} accent />
      </div>
    </motion.div>
  );
}

function CountPill({ icon: Icon, label, value, accent = false }) {
  return (
    <div className={`flex items-center justify-between border p-3 ${accent ? 'border-[#ff3f6c]/10 bg-[#ff3f6c]/5 text-[#ff3f6c]' : 'border-slate-100 bg-slate-50 text-slate-500'}`}>
      <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
        <Icon size={13} /> {label}
      </span>
      <span className="font-black">{value}</span>
    </div>
  );
}

function FormField({ children, error, label, required = false }) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label} {required && '*'}
      </label>
      {children}
      {error && <p className="mt-2 text-[10px] font-bold text-red-500">{error}</p>}
    </div>
  );
}

function UploadField({ file, label, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <div className="relative border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition-colors hover:bg-white">
        <input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0] || null)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        <p className="truncate text-[10px] font-black uppercase tracking-widest text-slate-500">{file ? file.name : 'Upload Image'}</p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="flex items-center justify-between border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
        <h4 className="text-3xl font-black text-[#282c3f]">{Number(value || 0).toLocaleString('en-IN')}</h4>
      </div>
      <div className={`grid size-12 place-items-center bg-slate-50 ${color}`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
    </div>
  );
}
