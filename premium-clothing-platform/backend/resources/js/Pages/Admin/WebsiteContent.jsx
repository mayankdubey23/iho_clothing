import React, { useEffect, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutTemplate, Image as ImageIcon, FileText, MessageSquare,
    HelpCircle, Settings, EyeOff, Eye, Plus, Star, X, Edit3, Trash2, ShoppingBag, Save, Dumbbell, Tags
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function WebsiteContent({ tabData = [], activeTab, stats = {} }) {
    const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState(null);
    const [isFeaturedCategoryModalOpen, setIsFeaturedCategoryModalOpen] = useState(false);
    const [editingFeaturedCategory, setEditingFeaturedCategory] = useState(null);
    const [featuredCategoryImageError, setFeaturedCategoryImageError] = useState('');
    const maxFeaturedCategoryImageSize = 4 * 1024 * 1024;

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_name: '',
        rating: 5,
        review_text: '',
        product_purchased: '',
        image: null,
    });

    const shopForm = useForm({
        group: 'shop_page',
        shop_hero_title: '',
        shop_hero_subtitle: '',
        shop_promo_banner: '',
        shop_seo_title: '',
        shop_hero_bg_image: null,
    });

    const gymWearForm = useForm({
        gym_wear_title: '',
        gym_wear_subtitle: '',
        gym_wear_description: '',
        gym_wear_promo_banner: '',
        gym_wear_seo_title: '',
        gym_wear_header_image: null,
    });

    const featuredCategoryForm = useForm({
        name: '',
        slug: '',
        sort_order: 0,
        image: null,
    });

    const {
        data: settingsData,
        setData: setSettingsData,
        post: postSettings,
        processing: settingsProcessing,
        errors: settingsErrors,
    } = useForm({
        shop_hero_title: '',
        shop_hero_subtitle: '',
        shop_promo_banner: '',
        shop_seo_title: '',
        shop_hero_bg_image: null,
    });

    useEffect(() => {
        if (activeTab !== 'shop_page') return;

        shopForm.setData({
            group: 'shop_page',
            shop_hero_title: tabData?.shop_hero_title || '',
            shop_hero_subtitle: tabData?.shop_hero_subtitle || '',
            shop_promo_banner: tabData?.shop_promo_banner || '',
            shop_seo_title: tabData?.shop_seo_title || '',
            shop_hero_bg_image: null,
        });
    }, [activeTab, tabData]);

    useEffect(() => {
        if (activeTab !== 'settings') return;

        setSettingsData({
            shop_hero_title: tabData?.shop_hero_title || '',
            shop_hero_subtitle: tabData?.shop_hero_subtitle || '',
            shop_promo_banner: tabData?.shop_promo_banner || '',
            shop_seo_title: tabData?.shop_seo_title || '',
            shop_hero_bg_image: null,
        });
    }, [activeTab, tabData]);

    useEffect(() => {
        if (activeTab !== 'gym_wear') return;

        gymWearForm.setData({
            gym_wear_title: tabData?.gym_wear_title || '',
            gym_wear_subtitle: tabData?.gym_wear_subtitle || '',
            gym_wear_description: tabData?.gym_wear_description || '',
            gym_wear_promo_banner: tabData?.gym_wear_promo_banner || '',
            gym_wear_seo_title: tabData?.gym_wear_seo_title || '',
            gym_wear_header_image: null,
        });
    }, [activeTab, tabData]);

    const tabs = [
        { id: 'banners', label: 'Banners & Sliders', icon: ImageIcon },
        { id: 'pages', label: 'Static Pages', icon: FileText },
        { id: 'shop_page', label: 'Shop Page', icon: ShoppingBag },
        { id: 'featured_categories', label: 'Featured Categories', icon: Tags },
        { id: 'gym_wear', label: 'Gym Wear', icon: Dumbbell },
        { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
        { id: 'faqs', label: 'FAQs', icon: HelpCircle },
        { id: 'settings', label: 'Site Settings', icon: Settings },
    ];

    const switchTab = (tabId) => {
        router.get('/franchise-superadmin/content', { tab: tabId }, { preserveState: true, preserveScroll: true });
    };

    const toggleStatus = (id, table) => {
        router.post('/franchise-superadmin/content/toggle-status', { id, table }, { preserveScroll: true });
    };

    const openCreateTestimonial = () => {
        setEditingTestimonial(null);
        reset();
        setData({
            customer_name: '',
            rating: 5,
            review_text: '',
            product_purchased: '',
            image: null,
        });
        setIsTestimonialModalOpen(true);
    };

    const openEditTestimonial = (review) => {
        setEditingTestimonial(review);
        setData({
            customer_name: review.customer_name || '',
            rating: Number(review.rating) || 5,
            review_text: review.review_text || '',
            product_purchased: review.product_purchased || '',
            image: null,
        });
        setIsTestimonialModalOpen(true);
    };

    const closeTestimonialModal = () => {
        setIsTestimonialModalOpen(false);
        setEditingTestimonial(null);
        reset();
    };

    const handleAddClick = () => {
        if (activeTab === 'testimonials') {
            openCreateTestimonial();
        } else if (activeTab === 'featured_categories') {
            openCreateFeaturedCategory();
        } else if (activeTab === 'shop_page' || activeTab === 'gym_wear' || activeTab === 'settings') {
            document.getElementById(`${activeTab}-settings`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            alert('Add New feature pending for this tab');
        }
    };

    const handleShopSettingsSubmit = (e) => {
        e.preventDefault();

        shopForm.post('/franchise-superadmin/content/shop-page', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleSettingsSubmit = (e) => {
        e.preventDefault();

        postSettings('/franchise-superadmin/content/settings', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleGymWearSubmit = (e) => {
        e.preventDefault();

        gymWearForm.post('/franchise-superadmin/content/gym-wear', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleTestimonialSubmit = (e) => {
        e.preventDefault();

        if (editingTestimonial) {
            router.post(`/franchise-superadmin/content/testimonials/${editingTestimonial.id}`, {
                ...data,
                _method: 'PUT',
            }, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: closeTestimonialModal,
            });
            return;
        }

        post('/franchise-superadmin/content/testimonials', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: closeTestimonialModal,
        });
    };

    const deleteTestimonial = (review) => {
        if (!window.confirm(`Delete review from ${review.customer_name}?`)) return;

        router.delete(`/franchise-superadmin/content/testimonials/${review.id}`, {
            preserveScroll: true,
        });
    };

    const openCreateFeaturedCategory = () => {
        setEditingFeaturedCategory(null);
        setFeaturedCategoryImageError('');
        featuredCategoryForm.reset();
        featuredCategoryForm.setData({
            name: '',
            slug: '',
            sort_order: Number(tabData?.length || 0),
            image: null,
        });
        setIsFeaturedCategoryModalOpen(true);
    };

    const openEditFeaturedCategory = (category) => {
        setEditingFeaturedCategory(category);
        setFeaturedCategoryImageError('');
        featuredCategoryForm.setData({
            name: category.name || '',
            slug: category.slug || '',
            sort_order: Number(category.sort_order) || 0,
            image: null,
        });
        setIsFeaturedCategoryModalOpen(true);
    };

    const closeFeaturedCategoryModal = () => {
        setIsFeaturedCategoryModalOpen(false);
        setEditingFeaturedCategory(null);
        setFeaturedCategoryImageError('');
        featuredCategoryForm.reset();
    };

    const handleFeaturedCategoryImageChange = (e) => {
        const file = e.target.files[0] || null;

        if (file && file.size > maxFeaturedCategoryImageSize) {
            e.target.value = '';
            featuredCategoryForm.setData('image', null);
            setFeaturedCategoryImageError('Image must be 4 MB or smaller.');
            return;
        }

        setFeaturedCategoryImageError('');
        featuredCategoryForm.setData('image', file);
    };

    const handleFeaturedCategorySubmit = (e) => {
        e.preventDefault();

        if (featuredCategoryImageError) {
            return;
        }

        if (editingFeaturedCategory) {
            router.post(`/franchise-superadmin/content/featured-categories/${editingFeaturedCategory.id}`, {
                ...featuredCategoryForm.data,
                _method: 'PUT',
            }, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: closeFeaturedCategoryModal,
            });
            return;
        }

        featuredCategoryForm.post('/franchise-superadmin/content/featured-categories', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: closeFeaturedCategoryModal,
        });
    };

    const toggleFeaturedCategory = (category) => {
        router.post(`/franchise-superadmin/content/featured-categories/${category.id}/toggle`, {}, {
            preserveScroll: true,
        });
    };

    const deleteFeaturedCategory = (category) => {
        if (!window.confirm(`Delete featured category "${category.name}"?`)) return;

        router.delete(`/franchise-superadmin/content/featured-categories/${category.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout active="content">
            <Head title="Website Content | Super Admin" />

            <div className="max-w-[1600px] mx-auto pb-20 pt-6 px-4 sm:px-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter flex items-center gap-3">
                            <LayoutTemplate className="text-[#E94E3C]" /> Storefront CMS
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Manage what your customers see on the live website.</p>
                    </div>
                    <button onClick={handleAddClick} className="bg-[#1A1A2E] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-all flex items-center gap-2 shadow-lg shadow-black/10">
                        <Plus size={18} /> {['shop_page', 'gym_wear', 'settings'].includes(activeTab) ? 'Edit Content' : activeTab === 'featured_categories' ? 'Add Featured Category' : `Add New ${activeTab === 'faqs' ? 'FAQ' : activeTab.slice(0, -1)}`}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard title="Active Banners" value={stats.active_banners || 0} icon={ImageIcon} color="text-blue-500" />
                    <StatCard title="Published Pages" value={stats.published_pages || 0} icon={FileText} color="text-green-500" />
                    <StatCard title="Live FAQs" value={stats.total_faqs || 0} icon={HelpCircle} color="text-purple-500" />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6 overflow-x-auto custom-scrollbar">
                    <div className="flex items-center gap-2 min-w-max">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button key={tab.id} onClick={() => switchTab(tab.id)} className={`relative flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive ? 'text-[#1A1A2E] bg-gray-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                                    <Icon size={16} className={isActive ? 'text-[#E94E3C]' : ''} />
                                    {tab.label}
                                    {isActive && <motion.div layoutId="activeCmsTab" className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#E94E3C] rounded-t-full" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-visible min-h-[400px] p-6">
                    {activeTab === 'banners' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tabData.map((banner) => (
                                <div key={banner.id} className={`border border-gray-100 rounded-2xl overflow-hidden relative group ${banner.status === 'inactive' ? 'opacity-60' : ''}`}>
                                    <div className="h-40 bg-gray-100 relative">
                                        {banner.image_path ? (
                                            <img
                                                src={`/storage/${banner.image_path}`}
                                                alt={banner.title || 'Storefront Banner'}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <span className="flex h-full items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                No Image Uploaded
                                            </span>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <button onClick={() => toggleStatus(banner.id, 'banners')} className="bg-white text-[#1A1A2E] p-3 rounded-full hover:bg-[#E94E3C] hover:text-white transition-colors">
                                                {banner.status === 'active' ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <h3 className="font-black text-[#1A1A2E] text-sm uppercase">{banner.title}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{banner.type}</p>
                                    </div>
                                </div>
                            ))}
                            {tabData.length === 0 && <EmptyState icon={ImageIcon} text="No Banners Uploaded" />}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <form id="settings-settings" onSubmit={handleSettingsSubmit} className="max-w-4xl space-y-8">
                            <div className="border-b border-gray-100 pb-6">
                                <h2 className="text-lg font-black text-[#1A1A2E] uppercase tracking-wider mb-1">Shop Page Configuration</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Control the main collection page visuals.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label="Shop Hero Title"
                                    value={settingsData.shop_hero_title}
                                    onChange={(e) => setSettingsData('shop_hero_title', e.target.value)}
                                    error={settingsErrors.shop_hero_title}
                                    placeholder="e.g. THE TITANIUM COLLECTION"
                                />
                                <InputField
                                    label="Shop SEO Title"
                                    value={settingsData.shop_seo_title}
                                    onChange={(e) => setSettingsData('shop_seo_title', e.target.value)}
                                    error={settingsErrors.shop_seo_title}
                                    placeholder="e.g. Shop Performance Wear | IHO STUDIO"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Shop Subtitle</label>
                                <textarea
                                    value={settingsData.shop_hero_subtitle}
                                    onChange={(e) => setSettingsData('shop_hero_subtitle', e.target.value)}
                                    rows="3"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none transition-all resize-none"
                                    placeholder="e.g. Engineered for peak performance."
                                />
                                {settingsErrors.shop_hero_subtitle && <p className="text-[10px] text-red-500 font-bold ml-1">{settingsErrors.shop_hero_subtitle}</p>}
                            </div>

                            <InputField
                                label="Global Promo Banner Text"
                                value={settingsData.shop_promo_banner}
                                onChange={(e) => setSettingsData('shop_promo_banner', e.target.value)}
                                error={settingsErrors.shop_promo_banner}
                                placeholder="e.g. FREE SHIPPING ON ORDERS ABOVE RS 5000"
                            />

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Shop Header Background Image</label>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setSettingsData('shop_hero_bg_image', e.target.files[0])}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-[#1A1A2E] cursor-pointer"
                                    />
                                    {tabData?.shop_hero_bg_image && (
                                        <div className="h-16 w-28 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                            <img src={`/storage/${tabData.shop_hero_bg_image}`} alt="Current shop header background" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1 mt-1">Leave empty to keep current image. Ideal aspect ratio 16:9.</p>
                                {settingsErrors.shop_hero_bg_image && <p className="text-[10px] text-red-500 font-bold ml-1">{settingsErrors.shop_hero_bg_image}</p>}
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex justify-end">
                                <button disabled={settingsProcessing} type="submit" className="bg-[#1A1A2E] text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-colors flex items-center gap-2 disabled:opacity-50">
                                    <Save size={16} /> {settingsProcessing ? 'Saving...' : 'Save All Settings'}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'gym_wear' && (
                        <form id="gym_wear-settings" onSubmit={handleGymWearSubmit} className="max-w-4xl space-y-6">
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                                <div className="mb-6 flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight text-[#1A1A2E]">Gym Wear Content</h3>
                                        <p className="mt-1 text-xs font-bold text-slate-500">Controls the Gym Wear collection banner and customer-facing description on the Shop page.</p>
                                    </div>
                                    <Dumbbell className="text-[#E94E3C]" size={28} />
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <InputField
                                        label="Gym Wear Title"
                                        value={gymWearForm.data.gym_wear_title}
                                        onChange={(e) => gymWearForm.setData('gym_wear_title', e.target.value)}
                                        error={gymWearForm.errors.gym_wear_title}
                                        placeholder="Gym Wear Collection"
                                    />
                                    <InputField
                                        label="SEO Title"
                                        value={gymWearForm.data.gym_wear_seo_title}
                                        onChange={(e) => gymWearForm.setData('gym_wear_seo_title', e.target.value)}
                                        error={gymWearForm.errors.gym_wear_seo_title}
                                        placeholder="Gym Wear | IHO STUDIO"
                                    />
                                </div>

                                <div className="mt-5 space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Short Subtitle</label>
                                    <textarea
                                        value={gymWearForm.data.gym_wear_subtitle}
                                        onChange={(e) => gymWearForm.setData('gym_wear_subtitle', e.target.value)}
                                        rows="2"
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] outline-none resize-none"
                                        placeholder="Training layers built for strength, sweat, and daily movement."
                                    />
                                    {gymWearForm.errors.gym_wear_subtitle && <p className="text-[10px] text-red-500 font-bold ml-1">{gymWearForm.errors.gym_wear_subtitle}</p>}
                                </div>

                                <div className="mt-5 space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Detail Description</label>
                                    <textarea
                                        value={gymWearForm.data.gym_wear_description}
                                        onChange={(e) => gymWearForm.setData('gym_wear_description', e.target.value)}
                                        rows="4"
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] outline-none resize-none"
                                        placeholder="Describe the gym wear collection, fabric, fit, training use, and customer benefits."
                                    />
                                    {gymWearForm.errors.gym_wear_description && <p className="text-[10px] text-red-500 font-bold ml-1">{gymWearForm.errors.gym_wear_description}</p>}
                                </div>

                                <div className="mt-5">
                                    <InputField
                                        label="Gym Wear Promo Text"
                                        value={gymWearForm.data.gym_wear_promo_banner}
                                        onChange={(e) => gymWearForm.setData('gym_wear_promo_banner', e.target.value)}
                                        error={gymWearForm.errors.gym_wear_promo_banner}
                                        placeholder="Flat 30% Off On Gym Wear"
                                    />
                                </div>

                                <div className="mt-5 space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gym Wear Header Image</label>
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => gymWearForm.setData('gym_wear_header_image', e.target.files[0])}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-[#1A1A2E]"
                                        />
                                        {tabData?.gym_wear_header_image && (
                                            <div className="h-16 w-28 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                                <img src={`/storage/${tabData.gym_wear_header_image}`} alt="Current gym wear header" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1 mt-1">Product item images, price, stock, and product description are edited under Super Admin Products.</p>
                                    {gymWearForm.errors.gym_wear_header_image && <p className="text-[10px] text-red-500 font-bold ml-1">{gymWearForm.errors.gym_wear_header_image}</p>}
                                </div>

                                <div className="mt-7 flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-6">
                                    <a href="/franchise-superadmin/products?subcategory=gym-wear" className="border border-slate-200 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A2E] hover:border-[#1A1A2E]">
                                        Edit Gym Products
                                    </a>
                                    <button
                                        disabled={gymWearForm.processing}
                                        type="submit"
                                        className="bg-[#1A1A2E] px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-white transition-colors hover:bg-[#E94E3C] disabled:opacity-60"
                                    >
                                        {gymWearForm.processing ? 'Saving...' : 'Save Gym Wear Content'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {activeTab === 'shop_page' && (
                        <form id="shop-page-settings" onSubmit={handleShopSettingsSubmit} className="max-w-4xl space-y-6">
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                                <div className="mb-6 flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight text-[#1A1A2E]">Shop Page Content</h3>
                                        <p className="mt-1 text-xs font-bold text-slate-500">These fields control the hero and promo text on the public Shop page.</p>
                                    </div>
                                    <ShoppingBag className="text-[#E94E3C]" size={28} />
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <InputField
                                        label="Hero Title"
                                        value={shopForm.data.shop_hero_title}
                                        onChange={(e) => shopForm.setData('shop_hero_title', e.target.value)}
                                        error={shopForm.errors.shop_hero_title}
                                        placeholder="The Collection"
                                    />
                                    <InputField
                                        label="SEO Title"
                                        value={shopForm.data.shop_seo_title}
                                        onChange={(e) => shopForm.setData('shop_seo_title', e.target.value)}
                                        error={shopForm.errors.shop_seo_title}
                                        placeholder="Shop Performance Wear | IHO STUDIO"
                                    />
                                </div>

                                <div className="mt-5 space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hero Subtitle</label>
                                    <textarea
                                        value={shopForm.data.shop_hero_subtitle}
                                        onChange={(e) => shopForm.setData('shop_hero_subtitle', e.target.value)}
                                        rows="3"
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] outline-none resize-none"
                                        placeholder="Engineered for peak performance."
                                    />
                                    {shopForm.errors.shop_hero_subtitle && <p className="text-[10px] text-red-500 font-bold ml-1">{shopForm.errors.shop_hero_subtitle}</p>}
                                </div>

                                <div className="mt-5">
                                    <InputField
                                        label="Promo Banner Text"
                                        value={shopForm.data.shop_promo_banner}
                                        onChange={(e) => shopForm.setData('shop_promo_banner', e.target.value)}
                                        error={shopForm.errors.shop_promo_banner}
                                        placeholder="Free shipping on orders above Rs 2,999"
                                    />
                                </div>

                                <div className="mt-5 space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hero Background Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => shopForm.setData('shop_hero_bg_image', e.target.files[0])}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-[#1A1A2E]"
                                    />
                                    {tabData?.shop_hero_bg_image && (
                                        <p className="text-[10px] font-bold text-gray-400 ml-1">Current image: {tabData.shop_hero_bg_image}</p>
                                    )}
                                    {shopForm.errors.shop_hero_bg_image && <p className="text-[10px] text-red-500 font-bold ml-1">{shopForm.errors.shop_hero_bg_image}</p>}
                                </div>

                                <button
                                    disabled={shopForm.processing}
                                    type="submit"
                                    className="mt-7 bg-[#1A1A2E] px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-white transition-colors hover:bg-[#E94E3C] disabled:opacity-60"
                                >
                                    {shopForm.processing ? 'Saving...' : 'Save Shop Page'}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'featured_categories' && (
                        <div className="space-y-6">
                            <div className="flex flex-col gap-2 border-b border-gray-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-wider text-[#1A1A2E]">Homepage Featured Categories</h2>
                                    <p className="text-xs font-bold text-gray-400">Controls the public “The Collections” section. Cards appear by sort order.</p>
                                </div>
                                <button onClick={openCreateFeaturedCategory} className="flex items-center justify-center gap-2 bg-[#1A1A2E] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#E94E3C]">
                                    <Plus size={16} /> Add Card
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {tabData.map((category) => (
                                    <div key={category.id} className={`overflow-hidden border border-gray-100 bg-white shadow-sm ${category.is_active ? '' : 'opacity-60'}`}>
                                        <div className="relative h-48 bg-slate-100">
                                            {category.image_url ? (
                                                <img
                                                    src={category.image_url}
                                                    alt={category.name}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center px-4 text-center text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                                                    {category.name || 'No Image Uploaded'}
                                                </div>
                                            )}
                                            <div className="absolute left-4 top-4 bg-white/95 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#1A1A2E]">
                                                Order {category.sort_order}
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <div className="mb-5 flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="text-lg font-black uppercase tracking-tight text-[#1A1A2E]">{category.name}</h3>
                                                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">/{category.slug}</p>
                                                </div>
                                                <span className={`shrink-0 px-2 py-1 text-[9px] font-black uppercase tracking-widest ${category.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                                    {category.is_active ? 'Active' : 'Hidden'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
                                                <button onClick={() => openEditFeaturedCategory(category)} className="bg-gray-100 p-2 text-gray-600 hover:bg-[#1A1A2E] hover:text-white" title="Edit featured category">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button onClick={() => toggleFeaturedCategory(category)} className="bg-gray-100 p-2 text-gray-600 hover:bg-[#1A1A2E] hover:text-white" title="Show or hide featured category">
                                                    {category.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                                <button onClick={() => deleteFeaturedCategory(category)} className="bg-red-50 p-2 text-red-500 hover:bg-red-500 hover:text-white" title="Delete featured category">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {tabData.length === 0 && <EmptyState icon={Tags} text="No Featured Categories Added" />}
                            </div>
                        </div>
                    )}

                    {activeTab === 'testimonials' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {tabData.map((review) => (
                                <div key={review.id} className={`bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between transition-colors ${review.status === 'inactive' ? 'opacity-60 bg-gray-50' : 'hover:border-[#1A1A2E]/20'}`}>
                                    <div className="mb-4 flex justify-between items-start gap-4 border-b border-gray-100 pb-4">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="font-black text-[#1A1A2E] uppercase">{review.customer_name}</h4>
                                                {review.is_dummy && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest rounded bg-amber-50 px-2 py-1 text-amber-600">Dummy</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                Product: <span className="text-[#E94E3C]">{review.product_purchased || 'N/A'}</span>
                                            </p>
                                        </div>
                                        {review.image_path && (
                                            <img src={`/storage/${review.image_path}`} alt="review" className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                                        )}
                                    </div>

                                    <div className="mb-6 grow">
                                        <div className="flex gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                                            ))}
                                        </div>
                                        <p className="text-sm font-medium text-gray-600 leading-relaxed italic line-clamp-3">
                                            "{review.review_text}"
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${review.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                            {review.status}
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEditTestimonial(review)} className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-[#1A1A2E] hover:text-white transition-colors" title="Edit review">
                                                <Edit3 size={16} />
                                            </button>
                                            <button onClick={() => toggleStatus(review.id, 'testimonials')} className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-[#1A1A2E] hover:text-white transition-colors" title="Show or hide review">
                                                {review.status === 'active' ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                            <button onClick={() => deleteTestimonial(review)} className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors" title="Delete review">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {tabData.length === 0 && <EmptyState icon={MessageSquare} text="No Reviews Added Yet" />}
                        </div>
                    )}

                    {activeTab === 'faqs' && (
                        <div className="space-y-4">
                            {tabData.map((faq) => (
                                <div key={faq.id} className="p-4 border border-gray-100 rounded-2xl bg-gray-50">
                                    <p className="font-bold">{faq.question}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isTestimonialModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A2E]/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
                            <div className="bg-white p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-black text-[#1A1A2E] uppercase tracking-wider flex items-center gap-2">
                                    <MessageSquare size={18} className="text-[#E94E3C]" /> {editingTestimonial ? 'Edit Customer Review' : 'Add Customer Review'}
                                </h3>
                                <button type="button" onClick={closeTestimonialModal} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleTestimonialSubmit} className="p-6 space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <InputField label="Customer Name *" value={data.customer_name} onChange={(e) => setData('customer_name', e.target.value)} error={errors.customer_name} required />
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Star Rating</label>
                                        <select value={data.rating} onChange={(e) => setData('rating', parseInt(e.target.value, 10))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] outline-none">
                                            {[5, 4, 3, 2, 1].map((num) => <option key={num} value={num}>{num} Stars</option>)}
                                        </select>
                                    </div>
                                </div>

                                <InputField label="Product Purchased (Optional)" value={data.product_purchased} onChange={(e) => setData('product_purchased', e.target.value)} error={errors.product_purchased} placeholder="e.g. Titanium Aero-Weave Tee" />

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Review Text *</label>
                                    <textarea value={data.review_text} onChange={(e) => setData('review_text', e.target.value)} rows="3" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] outline-none resize-none" required placeholder="What did the customer say?"></textarea>
                                    {errors.review_text && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.review_text}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Customer Image (Optional)</label>
                                    <input type="file" accept="image/*" onChange={(e) => setData('image', e.target.files[0])} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-[#1A1A2E]" />
                                    {editingTestimonial?.image_path && <p className="text-[10px] font-bold text-gray-400 ml-1">Leave empty to keep current image.</p>}
                                </div>

                                <button disabled={processing} type="submit" className="w-full bg-[#1A1A2E] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#E94E3C] transition-colors mt-4">
                                    {processing ? 'Saving...' : editingTestimonial ? 'Update Review' : 'Publish Review'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isFeaturedCategoryModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A2E]/60 p-4 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl overflow-hidden bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-gray-100 bg-white p-6">
                                <h3 className="flex items-center gap-2 font-black uppercase tracking-wider text-[#1A1A2E]">
                                    <Tags size={18} className="text-[#E94E3C]" /> {editingFeaturedCategory ? 'Edit Featured Category' : 'Add Featured Category'}
                                </h3>
                                <button type="button" onClick={closeFeaturedCategoryModal} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleFeaturedCategorySubmit} className="space-y-5 p-6">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <InputField
                                        label="Display Name *"
                                        value={featuredCategoryForm.data.name}
                                        onChange={(e) => featuredCategoryForm.setData('name', e.target.value)}
                                        error={featuredCategoryForm.errors.name}
                                        placeholder="Men Sportswear"
                                        required
                                    />
                                    <InputField
                                        label="Category Slug *"
                                        value={featuredCategoryForm.data.slug}
                                        onChange={(e) => featuredCategoryForm.setData('slug', e.target.value)}
                                        error={featuredCategoryForm.errors.slug}
                                        placeholder="men"
                                        required
                                    />
                                </div>

                                <InputField
                                    label="Sort Order"
                                    type="number"
                                    min="0"
                                    value={featuredCategoryForm.data.sort_order}
                                    onChange={(e) => featuredCategoryForm.setData('sort_order', e.target.value)}
                                    error={featuredCategoryForm.errors.sort_order}
                                />

                                <div className="space-y-1.5">
                                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Card Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFeaturedCategoryImageChange}
                                        className="w-full bg-gray-50 border border-gray-200 px-4 py-2 text-sm font-bold text-[#1A1A2E]"
                                    />
                                    {editingFeaturedCategory?.image_url && (
                                        <div className="mt-3 flex items-center gap-3">
                                            <img src={editingFeaturedCategory.image_url} alt={editingFeaturedCategory.name} className="h-16 w-28 object-cover" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Leave empty to keep current image.</p>
                                        </div>
                                    )}
                                    {(featuredCategoryImageError || featuredCategoryForm.errors.image) && (
                                        <p className="ml-1 text-[10px] font-bold text-red-500">
                                            {featuredCategoryImageError || featuredCategoryForm.errors.image}
                                        </p>
                                    )}
                                </div>

                                <button disabled={featuredCategoryForm.processing} type="submit" className="w-full bg-[#1A1A2E] py-4 font-black uppercase tracking-widest text-white transition-colors hover:bg-[#E94E3C] disabled:opacity-50">
                                    {featuredCategoryForm.processing ? 'Saving...' : editingFeaturedCategory ? 'Update Category' : 'Create Category'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}

function StatCard({ title, value, icon: Icon, color }) {
    return (
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</p>
                <h4 className="text-2xl font-black text-[#1A1A2E]">{value}</h4>
            </div>
            <div className={`size-12 rounded-2xl flex items-center justify-center bg-gray-50 ${color}`}><Icon size={20} strokeWidth={2.5} /></div>
        </div>
    );
}

function EmptyState({ icon: Icon, text }) {
    return (
        <div className="col-span-full py-16 text-center">
            <Icon size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} />
            <p className="text-[#1A1A2E] font-black text-lg">{text}</p>
        </div>
    );
}

function InputField({ label, error, ...props }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#1A1A2E] focus:ring-2 focus:ring-[#E94E3C] outline-none transition-all" {...props} />
            {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
        </div>
    );
}
