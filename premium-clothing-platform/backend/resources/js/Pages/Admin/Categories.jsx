import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Image as ImageIcon, EyeOff, Eye,
  MoreVertical, FolderTree, Package, LayoutGrid, X, Upload
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Categories({ categories, stats, filters }) {
  const safeCategories = categories?.data || [];
  const [search, setSearch] = useState(filters?.search || '');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form setup with file support
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '', description: '', image: null, banner: null
  });

  const toggleStatus = (id) => {
    router.post(`/franchise-superadmin/categories/${id}/toggle-status`, {}, { preserveScroll: true });
  };

  const submit = (e) => {
    e.preventDefault();
    post('/franchise-superadmin/categories', {
      onSuccess: () => { setIsAddModalOpen(false); reset(); }
    });
  };

  return (
    <AdminLayout active="inventory">
      <Head title="Categories | Super Admin" />

      <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">

        {/* 🚀 HEADER & STATS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
              <LayoutGrid className="text-[#E94E3C]" /> Store Categories
            </h1>
            <p className="text-gray-500 font-bold text-sm mt-1">Organize your catalog with parent categories and banners.</p>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-[#1A1A2E] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-all flex items-center gap-2 shadow-lg shadow-black/10">
            <Plus size={18} /> New Category
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard title="Parent Categories" value={stats?.total_categories} icon={LayoutGrid} color="text-blue-500" />
          <StatCard title="Sub Categories" value={stats?.total_subcategories} icon={FolderTree} color="text-purple-500" />
          <StatCard title="Active Collections" value={stats?.active_categories} icon={Eye} color="text-green-500" />
        </div>

        {/* 🚀 FILTERS BAR */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-8 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Search categories..."
              value={search} onChange={e => setSearch(e.target.value)} onKeyPress={e => e.key === 'Enter' && router.get('/franchise-superadmin/categories', { search }, { preserveState: true })}
              className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none"
            />
          </div>
        </div>

        {/* 🚀 CATEGORY VISUAL GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {safeCategories.length > 0 ? safeCategories.map((category) => (
            <motion.div key={category.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-black/5 transition-all group flex flex-col h-full">

              {/* Banner & Image Section */}
              <div className="h-32 bg-gray-100 relative shrink-0">
                <img
                  src={category.banner ? `/storage/${category.banner}` : 'https://placehold.co/600x200/1A1A2E/ffffff?text=No+Banner'}
                  className="w-full h-full object-cover opacity-80" alt="Banner"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                <div className="absolute -bottom-6 left-6 size-16 bg-white p-1 rounded-2xl shadow-lg">
                  <img
                    src={category.image ? `/storage/${category.image}` : 'https://placehold.co/100x100/f8fafc/94a3b8?text=Icon'}
                    className="w-full h-full object-cover rounded-xl" alt={category.name}
                  />
                </div>

                <button onClick={() => toggleStatus(category.id)} className={`absolute top-4 right-4 p-2 rounded-xl backdrop-blur-md transition-all ${category.status === 'active' ? 'bg-white/20 text-white hover:bg-white hover:text-[#1A1A2E]' : 'bg-red-500/80 text-white'}`}>
                  {category.status === 'active' ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>

              {/* Content Section */}
              <div className="p-6 pt-10 flex flex-col flex-1">
                <h3 className="font-black text-[#1A1A2E] text-xl uppercase tracking-tight mb-1">{category.name}</h3>
                <p className="text-xs font-bold text-gray-400 mb-6 line-clamp-2">{category.description || 'No description provided.'}</p>

                <div className="mt-auto flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 p-3 rounded-2xl flex items-center justify-between border border-gray-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5"><FolderTree size={14} /> Subcats</span>
                    <span className="font-black text-[#1A1A2E]">{category.sub_categories_count || 0}</span>
                  </div>
                  <div className="flex-1 bg-[#E94E3C]/5 p-3 rounded-2xl flex items-center justify-between border border-[#E94E3C]/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#E94E3C] flex items-center gap-1.5"><Package size={14} /> Products</span>
                    <span className="font-black text-[#E94E3C]">{category.products_count || 0}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center">
              <LayoutGrid size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} />
              <p className="text-[#1A1A2E] font-black text-lg">No Categories Found</p>
            </div>
          )}
        </div>

      </div>

      {/* 🚀 MODAL: ADD NEW CATEGORY */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A2E]/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md p-6 border-b border-gray-100 flex justify-between items-center z-10">
                <h3 className="font-black text-[#1A1A2E] uppercase tracking-wider flex items-center gap-2"><Plus size={18} className="text-[#E94E3C]" /> Create Category</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
              </div>

              <form onSubmit={submit} className="p-6 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category Name *</label>
                  <input type="text" required value={data.name} onChange={e => setData('name', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none" placeholder="e.g. Men Sportswear, Yoga Wear..." />
                  {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                  <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows="3" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none resize-none"></textarea>
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Square Icon (Logo)</label>
                    <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                      <input type="file" accept="image/*" onChange={e => setData('image', e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <ImageIcon size={24} className="mx-auto text-gray-400 mb-2" />
                      <span className="text-[10px] font-bold text-gray-500 block truncate">{data.image ? data.image.name : 'Upload Icon'}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Wide Banner</label>
                    <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                      <input type="file" accept="image/*" onChange={e => setData('banner', e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                      <span className="text-[10px] font-bold text-gray-500 block truncate">{data.banner ? data.banner.name : 'Upload Banner'}</span>
                    </div>
                  </div>
                </div>

                <button disabled={processing} type="submit" className="w-full bg-[#1A1A2E] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-colors disabled:opacity-50 mt-4 shadow-xl shadow-black/10">
                  {processing ? 'Creating...' : 'Save Category'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </AdminLayout>
  );
}

// 💎 Helper Component
function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</p>
        <h4 className="text-2xl font-black text-[#1A1A2E]">{value?.toLocaleString() || 0}</h4>
      </div>
      <div className={`size-12 rounded-2xl flex items-center justify-center bg-gray-50 ${color}`}><Icon size={20} strokeWidth={2.5} /></div>
    </div>
  );
}