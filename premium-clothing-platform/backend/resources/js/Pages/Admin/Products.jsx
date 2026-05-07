import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import {
  AlertTriangle, ChevronDown, ChevronRight,
  Eye, Image as ImageIcon, Package, PackagePlus,
  Pencil, Plus, Trash2, X, UploadCloud
} from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputCls     = 'w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const miniInputCls = 'w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-100';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function stockFor(product) {
  return product?.skus?.reduce((t, sku) => t + Number(sku.inventory?.stock_quantity || 0), 0) || 0;
}

function StockBadge({ qty }) {
  if (qty === 0) return <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">Out of stock</span>;
  if (qty < 10) return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">{qty} low</span>;
  return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">{qty} units</span>;
}

// ─── Modal primitives ─────────────────────────────────────────────────────────
function ModalWrapper({ children, onClose, maxW = 'max-w-2xl' }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className={`w-full ${maxW} max-h-[92vh] overflow-y-auto overflow-x-hidden rounded-2xl bg-white shadow-2xl`}
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

function ModalHeader({ title, onClose }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-900 px-6 py-4">
      <h3 className="text-base font-black text-white">{title}</h3>
      <button onClick={onClose} className="rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
        <X size={20} />
      </button>
    </div>
  );
}

function FormField({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

// ─── Inline SKU edit row ──────────────────────────────────────────────────────
function SkuEditRow({ sku, editData, onStartEdit, onUpdate, onCancel, onSave, onDelete, saving }) {
  const qty = Number(sku.inventory?.stock_quantity ?? 0);

  if (editData) {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-3">
        <div className="mb-2 grid grid-cols-3 gap-2">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">SKU Name</label>
            <input className={miniInputCls} value={editData.name} onChange={(e) => onUpdate('name', e.target.value)} placeholder="Black Large" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Size</label>
            <input className={miniInputCls} value={editData.size} onChange={(e) => onUpdate('size', e.target.value)} placeholder="XL, L…" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Color</label>
            <input className={miniInputCls} value={editData.color} onChange={(e) => onUpdate('color', e.target.value)} placeholder="Black…" />
          </div>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="w-32">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Stock Qty</label>
            <input type="number" min="0" className={miniInputCls} value={editData.stock_quantity} onChange={(e) => onUpdate('stock_quantity', e.target.value)} />
          </div>
          <div className="flex gap-1.5">
            <button type="button" onClick={onCancel} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200">
              Cancel
            </button>
            <button type="button" onClick={onSave} disabled={saving} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save SKU'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 transition-colors hover:bg-slate-50/60">
      <div>
        <p className="text-sm font-bold text-slate-800">{sku.name || `SKU #${sku.id}`}</p>
        <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-slate-400">
          {sku.size  && <span>Size: <strong className="text-slate-600">{sku.size}</strong></span>}
          {sku.color && <span>Color: <strong className="text-slate-600">{sku.color}</strong></span>}
          {!sku.size && !sku.color && <span className="italic">No size/color set</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <StockBadge qty={qty} />
        <button
          type="button"
          onClick={onStartEdit}
          className="grid size-7 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
          title="Edit name, size, color & stock"
        >
          <Pencil size={13} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="grid size-7 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
          title="Delete SKU"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Main page component ──────────────────────────────────────────────────────
export default function Products({ products, categories }) {

  // ── Create product ─────────────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [preview, setPreview] = useState(null); // Local state for image preview

  const { data, setData, post, processing, reset, errors } = useForm({
    name: '', slug: '', category_id: categories[0]?.id || '',
    base_price: '', franchise_price: '', description: '', is_active: true, image: null
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('image', file);
      setPreview(URL.createObjectURL(file));
    }
  };

  function submitCreate(e) {
    e.preventDefault();
    post('/admin/products', { 
      forceFormData: true, // Required for file uploads
      onSuccess: () => { 
        setShowCreate(false); 
        reset(); 
        setPreview(null);
      } 
    });
  }

  // ── Edit product ───────────────────────────────────────────────────────────
  const [editProduct, setEditProduct] = useState(null);
  const {
    data: editData, setData: setEditData,
    patch: patchProduct, processing: editProcessing,
    reset: resetEdit, errors: editErrors,
  } = useForm({ name: '', slug: '', category_id: '', base_price: '', franchise_price: '', description: '', is_active: true });

  function openEdit(product) {
    setEditProduct(product);
    setEditData({
      name: product.name,
      slug: product.slug,
      category_id: String(product.category_id),
      base_price: String(product.base_price),
      franchise_price: String(product.franchise_price),
      description: product.description || '',
      is_active: product.is_active,
    });
  }
  function submitEdit(e) {
    e.preventDefault();
    patchProduct(`/admin/products/${editProduct.id}`, {
      onSuccess: () => { setEditProduct(null); resetEdit(); },
    });
  }

  // Sync editProduct with fresh page props after Inertia reloads (SKU add/edit/delete)
  useEffect(() => {
    if (!editProduct) return;
    const fresh = products.data.find((p) => p.id === editProduct.id);
    if (fresh) setEditProduct(fresh);
  }, [products]);

  // ── Inline SKU editing (within edit modal) ─────────────────────────────────
  const [editingSkus, setEditingSkus] = useState({});
  const [savingSkuId, setSavingSkuId] = useState(null);

  function startSkuEdit(sku) {
    setEditingSkus((prev) => ({
      ...prev,
      [sku.id]: {
        name:           sku.name  || '',
        size:           sku.size  || '',
        color:          sku.color || '',
        stock_quantity: String(sku.inventory?.stock_quantity ?? 0),
      },
    }));
  }
  function updateSkuField(skuId, field, value) {
    setEditingSkus((prev) => ({ ...prev, [skuId]: { ...prev[skuId], [field]: value } }));
  }
  function cancelSkuEdit(skuId) {
    setEditingSkus((prev) => { const n = { ...prev }; delete n[skuId]; return n; });
  }
  function saveSkuEdit(skuId) {
    const payload = editingSkus[skuId];
    setSavingSkuId(skuId);
    router.patch(`/admin/skus/${skuId}`, payload, {
      preserveScroll: true,
      onSuccess: () => { cancelSkuEdit(skuId); setSavingSkuId(null); },
      onError:   () =>  setSavingSkuId(null),
    });
  }
  function deleteSku(skuId) {
    if (!confirm('Delete this SKU? Its inventory will also be removed.')) return;
    router.delete(`/admin/skus/${skuId}`, { preserveScroll: true });
  }

  // ── Add SKU ────────────────────────────────────────────────────────────────
  const [skuProduct, setSkuProduct] = useState(null);
  const {
    data: skuData, setData: setSkuData,
    post: postSku, processing: skuProcessing,
    reset: resetSku, errors: skuErrors,
  } = useForm({ name: '', size: '', color: '', stock_quantity: '' });
  
  function submitSku(e) {
    e.preventDefault();
    postSku(`/admin/products/${skuProduct.id}/skus`, {
      preserveScroll: true,
      onSuccess: () => { setSkuProduct(null); resetSku(); },
    });
  }

  // ── UI state ───────────────────────────────────────────────────────────────
  const [expandedId, setExpandedId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ── Inventory stats ────────────────────────────────────────────────────────
  const totalStock      = products.data.reduce((t, p) => t + stockFor(p), 0);
  const lowStockCount   = products.data.filter((p) => { const s = stockFor(p); return s > 0 && s < 10; }).length;
  const outOfStockCount = products.data.filter((p) => stockFor(p) === 0).length;

  return (
    <AdminLayout active="products">
      <Head title="Products | Admin" />

      {/* ── Page Header ── */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-black text-slate-900">Product Catalog</h1>
          <p className="mt-1 text-sm font-medium text-slate-400">Manage all retail and franchise inventory.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* ── Inventory Overview ── */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Total Stock</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{totalStock.toLocaleString('en-IN')}</p>
          <p className="text-xs text-slate-400">units across all products</p>
        </div>
        <div className={`rounded-xl border p-4 shadow-sm ${lowStockCount > 0 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-amber-600">Low Stock</p>
          <p className={`mt-1 text-3xl font-black ${lowStockCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>{lowStockCount}</p>
          <p className="text-xs text-slate-400">products below 10 units</p>
        </div>
        <div className={`rounded-xl border p-4 shadow-sm ${outOfStockCount > 0 ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-red-500">Out of Stock</p>
          <p className={`mt-1 text-3xl font-black ${outOfStockCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>{outOfStockCount}</p>
          <p className="text-xs text-slate-400">products need restocking</p>
        </div>
      </div>

      {/* ── Products Table ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {products.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-slate-100">
              <Package size={28} className="text-slate-400" />
            </div>
            <p className="font-semibold text-slate-500">No products yet. Add your first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="w-8 px-3 py-3.5" />
                  {['ID', 'Product', 'Category', 'Retail Price', 'Franchise Price', 'Stock', 'Status', ''].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.data.map((product) => {
                  const totalProductStock = stockFor(product);
                  const isExpanded = expandedId === product.id;
                  return (
                    <>
                      <tr key={product.id} className="transition-colors hover:bg-slate-50/60">
                        <td className="px-3 py-4">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : product.id)}
                            className="grid size-6 place-items-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            title="View SKU inventory"
                          >
                            {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-blue-50 px-2.5 py-1 font-mono text-sm font-bold text-blue-700">#{product.id}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3.5">
                            {/* ── Updated Image Display ── */}
                            <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-slate-400">
                              {product.images?.[0] ? (
                                <img src={product.images[0].image_path} alt={product.name} className="h-full w-full object-cover" />
                              ) : (
                                <ImageIcon size={18} />
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900">{product.name}</span>
                              <p className="text-xs text-slate-400">/{product.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                            {product.category?.name || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-900">₹{Number(product.base_price).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4 font-bold text-orange-600">₹{Number(product.franchise_price).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <StockBadge qty={totalProductStock} />
                            {totalProductStock > 0 && totalProductStock < 10 && (
                              <AlertTriangle size={14} className="text-amber-500" title="Low stock" />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${product.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(product)}
                              className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
                              title="Edit product + manage SKUs"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setSelectedProduct(product)}
                              className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                              title="View full details"
                            >
                              <Eye size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* SKU expand row */}
                      <AnimatePresence>
                        {isExpanded && (
                          <tr key={`sku-${product.id}`}>
                            <td colSpan={9} className="bg-slate-50/60 px-5 py-0">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="py-4">
                                  <div className="mb-3 flex items-center justify-between">
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                      SKU Inventory Breakdown
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-slate-400">Edit SKU details via the ✏ button on the row</span>
                                      <button
                                        onClick={() => { setSkuProduct(product); resetSku(); }}
                                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                                      >
                                        <PackagePlus size={13} /> Add SKU
                                      </button>
                                    </div>
                                  </div>

                                  {product.skus && product.skus.length > 0 ? (
                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                      {product.skus.map((sku) => {
                                        const qty = Number(sku.inventory?.stock_quantity || 0);
                                        return (
                                          <div key={sku.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                                            <div className="flex items-start justify-between">
                                              <div>
                                                <p className="text-sm font-bold text-slate-800">{sku.name || `SKU #${sku.id}`}</p>
                                                <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-slate-400">
                                                  {sku.size  && <span>Size: {sku.size}</span>}
                                                  {sku.color && <span>Color: {sku.color}</span>}
                                                </div>
                                              </div>
                                              <StockBadge qty={qty} />
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-4 text-center text-sm font-medium text-blue-600">
                                      ⚠️ No SKUs — click <strong>Add SKU</strong> to set up inventory and fix "Out of stock".
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detail side panel ── */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailPanel product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        )}
      </AnimatePresence>

      {/* ══ CREATE PRODUCT MODAL ══ */}
      <AnimatePresence>
        {showCreate && (
          <ModalWrapper onClose={() => { setShowCreate(false); setPreview(null); }}>
            <ModalHeader title="Create New Product" onClose={() => { setShowCreate(false); setPreview(null); }} />
            <div className="p-6">
              <form onSubmit={submitCreate}>
                
                {/* ── Image Upload Area ── */}
                <div className="mb-6">
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Product Image</label>
                  <div className="group relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:bg-slate-100">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
                    {preview ? (
                      <div className="relative h-48 w-full">
                        <img src={preview} alt="Preview" className="h-full w-full object-contain p-2" />
                        <div className="absolute inset-0 bg-slate-900/10 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    ) : (
                      <div className="flex h-32 flex-col items-center justify-center text-slate-400 group-hover:text-blue-500">
                        <UploadCloud size={32} className="mb-2" />
                        <p className="text-sm font-bold">Click or drag image to upload</p>
                      </div>
                    )}
                  </div>
                  {errors.image && <p className="mt-1 text-xs font-medium text-red-500">{errors.image}</p>}
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <FormField label="Product Name" error={errors.name}>
                    <input required className={inputCls} value={data.name} onChange={(e) => {
                      setData('name', e.target.value);
                      setData('slug', e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
                    }} />
                  </FormField>
                  <FormField label="URL Slug" error={errors.slug}>
                    <input required className={`${inputCls} font-mono`} placeholder="tshirt-black" value={data.slug} onChange={(e) => setData('slug', e.target.value)} />
                  </FormField>
                  <FormField label="Category" error={errors.category_id}>
                    <select className={inputCls} value={data.category_id} onChange={(e) => setData('category_id', e.target.value)}>
                      {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Retail Price (₹)" error={errors.base_price}>
                    <input required type="number" min="0" className={inputCls} value={data.base_price} onChange={(e) => setData('base_price', e.target.value)} />
                  </FormField>
                  <FormField label="Franchise Price (₹)" error={errors.franchise_price}>
                    <input required type="number" min="0" className={inputCls} value={data.franchise_price} onChange={(e) => setData('franchise_price', e.target.value)} />
                  </FormField>
                </div>
                <div className="mt-5">
                  <FormField label="Description" error={errors.description}>
                    <textarea className={`h-24 resize-none ${inputCls}`} value={data.description} onChange={(e) => setData('description', e.target.value)} />
                  </FormField>
                </div>
                <div className="mt-4">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-slate-700">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-blue-600" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                    Active (visible on storefront)
                  </label>
                </div>
                <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600">
                  💡 After creating, click the <strong>✏ Edit</strong> button on the product row to add SKUs and set stock.
                </p>
                <div className="mt-5 flex justify-end gap-3">
                  <button type="button" onClick={() => { setShowCreate(false); setPreview(null); }} className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200">Cancel</button>
                  <button type="submit" disabled={processing} className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:opacity-60">
                    {processing ? 'Saving…' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* ══ EDIT PRODUCT MODAL (includes SKU management) ══ */}
      <AnimatePresence>
        {editProduct && (
          <ModalWrapper onClose={() => setEditProduct(null)}>
            <ModalHeader title={`Edit — ${editProduct.name}`} onClose={() => setEditProduct(null)} />
            <div className="p-6">
              {/* ─ Product Info Form ─ */}
              <form onSubmit={submitEdit}>
                <div className="grid grid-cols-2 gap-5">
                  <FormField label="Product Name" error={editErrors.name}>
                    <input required className={inputCls} value={editData.name} onChange={(e) => setEditData('name', e.target.value)} />
                  </FormField>
                  <FormField label="URL Slug" error={editErrors.slug}>
                    <input required className={`${inputCls} font-mono`} value={editData.slug} onChange={(e) => setEditData('slug', e.target.value)} />
                  </FormField>
                  <FormField label="Category" error={editErrors.category_id}>
                    <select className={inputCls} value={editData.category_id} onChange={(e) => setEditData('category_id', e.target.value)}>
                      {categories.map((cat) => <option key={cat.id} value={String(cat.id)}>{cat.name}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Retail Price (₹)" error={editErrors.base_price}>
                    <input required type="number" min="0" className={inputCls} value={editData.base_price} onChange={(e) => setEditData('base_price', e.target.value)} />
                  </FormField>
                  <FormField label="Franchise Price (₹)" error={editErrors.franchise_price}>
                    <input required type="number" min="0" className={inputCls} value={editData.franchise_price} onChange={(e) => setEditData('franchise_price', e.target.value)} />
                  </FormField>
                </div>
                <div className="mt-5">
                  <FormField label="Description" error={editErrors.description}>
                    <textarea className={`h-20 resize-none ${inputCls}`} value={editData.description} onChange={(e) => setEditData('description', e.target.value)} />
                  </FormField>
                </div>
                <div className="mt-4">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-slate-700">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-blue-600" checked={editData.is_active} onChange={(e) => setEditData('is_active', e.target.checked)} />
                    Active (visible on storefront)
                  </label>
                </div>
                <div className="mt-5 flex justify-end gap-3">
                  <button type="button" onClick={() => setEditProduct(null)} className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200">Cancel</button>
                  <button type="submit" disabled={editProcessing} className="rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition-all hover:bg-amber-600 disabled:opacity-60">
                    {editProcessing ? 'Saving…' : 'Save Product Info'}
                  </button>
                </div>
              </form>

              {/* ─ SKU & Inventory Section ─ */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Variants & Inventory</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {editProduct.skus?.length || 0} SKU{(editProduct.skus?.length || 0) !== 1 ? 's' : ''} — edit name, size, color &amp; stock inline
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSkuProduct(editProduct); resetSku(); }}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                  >
                    <PackagePlus size={13} /> Add SKU
                  </button>
                </div>

                {editProduct.skus?.length > 0 ? (
                  <div className="space-y-2">
                    {editProduct.skus.map((sku) => (
                      <SkuEditRow
                        key={sku.id}
                        sku={sku}
                        editData={editingSkus[sku.id]}
                        saving={savingSkuId === sku.id}
                        onStartEdit={() => startSkuEdit(sku)}
                        onUpdate={(field, val) => updateSkuField(sku.id, field, val)}
                        onCancel={() => cancelSkuEdit(sku.id)}
                        onSave={() => saveSkuEdit(sku.id)}
                        onDelete={() => deleteSku(sku.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-4 text-center text-sm font-medium text-blue-600">
                    No SKUs yet — click <strong>Add SKU</strong> above to set up inventory.
                  </div>
                )}
              </div>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* ══ ADD SKU MODAL ══ */}
      <AnimatePresence>
        {skuProduct && (
          <ModalWrapper onClose={() => setSkuProduct(null)} maxW="max-w-lg">
            <ModalHeader title={`Add SKU — ${skuProduct.name}`} onClose={() => setSkuProduct(null)} />
            <form onSubmit={submitSku} className="grid gap-4 p-6">
              <FormField label="SKU Name" error={skuErrors.name}>
                <input required className={inputCls} placeholder="e.g. Black Large" value={skuData.name} onChange={(e) => setSkuData('name', e.target.value)} />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Size (optional)" error={skuErrors.size}>
                  <input className={inputCls} placeholder="XL, L, M…" value={skuData.size} onChange={(e) => setSkuData('size', e.target.value)} />
                </FormField>
                <FormField label="Color (optional)" error={skuErrors.color}>
                  <input className={inputCls} placeholder="Black, White…" value={skuData.color} onChange={(e) => setSkuData('color', e.target.value)} />
                </FormField>
              </div>
              <FormField label="Initial Stock Quantity" error={skuErrors.stock_quantity}>
                <input required type="number" min="0" className={inputCls} placeholder="e.g. 100" value={skuData.stock_quantity} onChange={(e) => setSkuData('stock_quantity', e.target.value)} />
              </FormField>
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setSkuProduct(null)} className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={skuProcessing} className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-60">
                  {skuProcessing ? 'Adding…' : 'Add SKU & Set Stock'}
                </button>
              </div>
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>

    </AdminLayout>
  );
}

// ─── Product Detail Panel ─────────────────────────────────────────────────────
function ProductDetailPanel({ product, onClose }) {
  const total = stockFor(product);
  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        className="fixed inset-y-0 right-0 z-50 flex w-[500px] max-w-full flex-col overflow-hidden bg-white shadow-2xl"
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="flex shrink-0 items-center justify-between bg-slate-900 px-6 py-4">
          <h3 className="flex items-center gap-2.5 text-base font-black text-white">
            <Package size={18} className="text-blue-400" /> Product Details
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-3">
          <div className="flex items-center gap-2.5">
            <span className="rounded-xl bg-blue-100 px-3 py-1.5 font-mono text-sm font-bold text-blue-700">Product #ID {product.id}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${product.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {product.is_active ? '● Active' : '○ Inactive'}
            </span>
          </div>
          <StockBadge qty={total} />
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          
          {/* ── Updated Image Display in Detail Panel ── */}
          {product.images?.[0] && (
            <div className="w-full h-48 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <img src={product.images[0].image_path} alt={product.name} className="h-full w-full object-contain" />
            </div>
          )}

          <div>
            <h2 className="text-2xl font-black text-slate-900">{product.name}</h2>
            <p className="mt-1 font-mono text-sm text-slate-400">Slug: /{product.slug}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Category',        value: product.category?.name || '—',                                        sub: product.category?.slug ? `/${product.category.slug}` : null },
              { label: 'Category ID',     value: product.category?.id   ? `#${product.category.id}` : '—', mono: true },
              { label: 'Retail Price',    value: `₹${Number(product.base_price).toLocaleString('en-IN')}`,      bold: true },
              { label: 'Franchise Price', value: `₹${Number(product.franchise_price).toLocaleString('en-IN')}`, bold: true, accent: true },
            ].map(({ label, value, sub, mono, bold, accent }) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <p className={`mt-1 break-all text-lg ${bold ? 'font-black' : 'font-semibold'} ${accent ? 'text-orange-600' : 'text-slate-900'} ${mono ? 'font-mono' : ''}`}>{value}</p>
                {sub && <p className="mt-0.5 font-mono text-xs text-slate-400">{sub}</p>}
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</p>
            <div className="min-h-16 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-600">
              {product.description || <span className="italic text-slate-400">No description provided.</span>}
            </div>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              SKU Inventory · {product.skus?.length || 0} variant{(product.skus?.length || 0) !== 1 ? 's' : ''}
            </p>
            {product.skus?.length > 0 ? (
              <div className="space-y-2.5">
                {product.skus.map((sku) => {
                  const qty = Number(sku.inventory?.stock_quantity || 0);
                  return (
                    <div key={sku.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                        <span className="font-mono text-xs font-bold text-slate-500">SKU #ID {sku.id}</span>
                        <StockBadge qty={qty} />
                      </div>
                      <div className="px-4 py-3">
                        <p className="font-bold text-slate-900">{sku.name || `Variant #${sku.id}`}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {sku.size  && <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Size: {sku.size}</span>}
                          {sku.color && <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Color: {sku.color}</span>}
                        </div>
                        {sku.inventory && (
                          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                            <span className="font-mono">Inventory #ID: {sku.inventory.id}</span>
                            <span>Stock: <strong className="text-slate-800">{sku.inventory.stock_quantity}</strong> units</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                No SKUs configured for this product.
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}