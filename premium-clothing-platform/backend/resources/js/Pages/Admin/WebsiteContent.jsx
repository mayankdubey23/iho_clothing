import React, { useEffect, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutTemplate, Image as ImageIcon, FileText, MessageSquare,
    HelpCircle, Settings, EyeOff, Eye, Plus, Star, X, Edit3, Trash2, ShoppingBag, Save, Dumbbell, Tags, Upload
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function WebsiteContent({ tabData = [], activeTab, stats = {} }) {
    const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState(null);
    const [isPageModalOpen, setIsPageModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState(null);
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [isFeaturedCategoryModalOpen, setIsFeaturedCategoryModalOpen] = useState(false);
    const [editingFeaturedCategory, setEditingFeaturedCategory] = useState(null);
    const [featuredCategoryImageError, setFeaturedCategoryImageError] = useState('');
    const maxFeaturedCategoryImageSize = 4 * 1024 * 1024;
    const siteSettingsDefaults = {
        site_brand_name: '',
        site_logo_mark: '',
        site_tagline: '',
        site_logo: null,
        nav_mobile_title: '',
        nav_search_placeholder: '',
        nav_promo_eyebrow: '',
        nav_promo_title: '',
        nav_promo_cta: '',
        nav_promo_link: '',
        nav_trending_searches_json: '',
        nav_links_json: '',
        nav_mega_menu_json: '',
        footer_about_text: '',
        footer_newsletter_title: '',
        footer_newsletter_placeholder: '',
        footer_copyright: '',
        footer_ad_text: '',
        footer_ad_cta: '',
        footer_ad_href: '',
        footer_link_groups_json: '',
        footer_trust_badges_json: '',
        footer_social_links_json: '',
        footer_payment_methods_json: '',
        footer_bottom_links_json: '',
    };
    const homepageSettingsDefaults = {
        home_seo_title: '',
        home_top_strip: '',
        home_hero_badge: '',
        home_hero_title: '',
        home_hero_subtitle: '',
        home_hero_cta_text: '',
        home_hero_cta_link: '',
        home_hero_secondary_text: '',
        home_hero_secondary_link: '',
        home_hero_media: null,
        home_hero_media_alt: '',
        home_sale_title: '',
        home_sale_subtitle: '',
        home_coupon_text: '',
        home_hidden_sections: '',
        home_section_order: '',
        home_product_section_count: '',
        home_category_offers_json: '',
        home_promo_tiles_json: '',
        home_categories_title: '',
        home_categories_subtitle: '',
        home_best_sellers_title: '',
        home_best_sellers_subtitle: '',
        home_new_arrivals_title: '',
        home_new_arrivals_subtitle: '',
        home_gym_title: '',
        home_gym_subtitle: '',
        home_offers_title: '',
        home_offers_subtitle: '',
        home_reviews_title: '',
        home_reviews_subtitle: '',
        home_trust_title: '',
        home_trust_subtitle: '',
        home_benefits_json: '',
        home_franchise_title: '',
        home_franchise_subtitle: '',
        home_franchise_cta_text: '',
        home_franchise_cta_link: '',
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_name: '',
        rating: 5,
        review_text: '',
        product_purchased: '',
        image: null,
    });

    const pageForm = useForm({
        slug: '',
        title: '',
        content: '',
        meta_title: '',
        meta_description: '',
        status: 'published',
    });

    const bannerForm = useForm({
        title: '',
        placement_type: 'main_hero_slider',
        desktop_image: null,
        mobile_image: null,
        target_url: '',
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
        banner_image: null,
        accent_color: '',
        style_theme: 'default',
    });

    const {
        data: settingsData,
        setData: setSettingsData,
        post: postSettings,
        processing: settingsProcessing,
        errors: settingsErrors,
    } = useForm({
        ...siteSettingsDefaults,
        ...homepageSettingsDefaults,
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
            ...Object.keys(siteSettingsDefaults).reduce((payload, key) => {
                payload[key] = key === 'site_logo' ? null : (tabData?.[key] || '');
                return payload;
            }, {}),
            ...Object.keys(homepageSettingsDefaults).reduce((payload, key) => {
                payload[key] = key === 'home_hero_media' ? null : (tabData?.[key] || '');
                return payload;
            }, {}),
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

    const openCreatePage = () => {
        setEditingPage(null);
        pageForm.reset();
        pageForm.setData({
            slug: '',
            title: '',
            content: '',
            meta_title: '',
            meta_description: '',
            status: 'published',
        });
        setIsPageModalOpen(true);
    };

    const openCreateBanner = () => {
        bannerForm.reset();
        bannerForm.setData({
            title: '',
            placement_type: 'main_hero_slider',
            desktop_image: null,
            mobile_image: null,
            target_url: '',
        });
        setIsBannerModalOpen(true);
    };

    const closeBannerModal = () => {
        setIsBannerModalOpen(false);
        bannerForm.reset();
    };

    const openEditPage = (page) => {
        setEditingPage(page);
        pageForm.setData({
            slug: page.slug || '',
            title: page.title || '',
            content: page.content || '',
            meta_title: page.meta_title || '',
            meta_description: page.meta_description || '',
            status: page.status || 'published',
        });
        setIsPageModalOpen(true);
    };

    const closePageModal = () => {
        setIsPageModalOpen(false);
        setEditingPage(null);
        pageForm.reset();
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
        } else if (activeTab === 'banners') {
            openCreateBanner();
        } else if (activeTab === 'pages') {
            openCreatePage();
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

    const handleBannerSubmit = (e) => {
        e.preventDefault();

        bannerForm.post('/franchise-superadmin/banners', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: closeBannerModal,
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
            router.put(`/franchise-superadmin/content/testimonials/${editingTestimonial.id}`, data, {
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

    const handlePageSubmit = (e) => {
        e.preventDefault();

        if (editingPage) {
            router.put(`/franchise-superadmin/content/pages/${editingPage.id}`, pageForm.data, {
                preserveScroll: true,
                onSuccess: closePageModal,
                onError: () => setIsPageModalOpen(true),
            });
            return;
        }

        pageForm.post('/franchise-superadmin/content/pages', {
            preserveScroll: true,
            onSuccess: closePageModal,
        });
    };

    const deletePage = (page) => {
        if (!window.confirm(`Delete static page "${page.title}"?`)) return;

        router.delete(`/franchise-superadmin/content/pages/${page.id}`, {
            preserveScroll: true,
        });
    };

    const toggleBanner = (banner) => {
        router.post(`/franchise-superadmin/banners/${banner.id}/toggle`, {}, {
            preserveScroll: true,
        });
    };

    const deleteBanner = (banner) => {
        if (!window.confirm(`Delete banner "${banner.title}" permanently?`)) return;

        router.delete(`/franchise-superadmin/banners/${banner.id}`, {
            preserveScroll: true,
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
            banner_image: null,
            accent_color: '',
            style_theme: 'default',
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
            banner_image: null,
            accent_color: category.accent_color || '',
            style_theme: category.style_theme || 'default',
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
            router.put(`/franchise-superadmin/content/featured-categories/${editingFeaturedCategory.id}`, {
                ...featuredCategoryForm.data,
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
                        <h1 className="text-3xl font-black text-[#282c3f] uppercase tracking-tighter flex items-center gap-3">
                            <LayoutTemplate className="text-[#ff3f6c]" /> Storefront CMS
                        </h1>
                        <p className="text-gray-500 font-bold text-sm mt-1">Manage what your customers see on the live website.</p>
                    </div>
                    <button onClick={handleAddClick} className="bg-[#282c3f] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#ff3f6c] transition-all flex items-center gap-2 shadow-lg shadow-black/10">
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
                                <button key={tab.id} onClick={() => switchTab(tab.id)} className={`relative flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive ? 'text-[#282c3f] bg-gray-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                                    <Icon size={16} className={isActive ? 'text-[#ff3f6c]' : ''} />
                                    {tab.label}
                                    {isActive && <motion.div layoutId="activeCmsTab" className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#ff3f6c] rounded-t-full" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-visible min-h-[400px] p-6">
                    {activeTab === 'banners' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tabData.map((banner) => (
                                <div key={banner.id} className={`border border-gray-100 rounded-2xl overflow-hidden relative group ${!banner.is_active ? 'opacity-60' : ''}`}>
                                    <div className="h-40 bg-gray-100 relative">
                                        {banner.desktop_image_path ? (
                                            <img
                                                src={`/storage/${banner.desktop_image_path}`}
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
                                            <button type="button" onClick={() => toggleBanner(banner)} className="bg-white text-[#282c3f] p-3 rounded-full hover:bg-[#ff3f6c] hover:text-white transition-colors" title={banner.is_active ? 'Hide banner' : 'Show banner'}>
                                                {banner.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                            <button type="button" onClick={() => deleteBanner(banner)} className="bg-white text-red-500 p-3 rounded-full hover:bg-red-500 hover:text-white transition-colors" title="Delete banner">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <h3 className="font-black text-[#282c3f] text-sm uppercase">{banner.title}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{String(banner.placement_type || '').replace(/_/g, ' ')}</p>
                                        <p className={`mt-2 text-[9px] font-black uppercase tracking-widest ${banner.is_active ? 'text-green-500' : 'text-red-500'}`}>
                                            {banner.is_active ? 'Live on storefront' : 'Hidden'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {tabData.length === 0 && <EmptyState icon={ImageIcon} text="No Banners Uploaded" />}
                        </div>
                    )}

                    {activeTab === 'pages' && (
                        <div className="space-y-6">
                            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 md:flex-row md:items-center">
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-wider text-[#282c3f]">Static Pages</h2>
                                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">Create, edit, publish, draft, and SEO-manage customer information pages.</p>
                                </div>
                                <button type="button" onClick={openCreatePage} className="inline-flex items-center justify-center gap-2 bg-[#282c3f] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#ff3f6c]">
                                    <Plus size={16} /> New Page
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                {tabData.map((page) => (
                                    <div key={page.id} className="border border-slate-100 bg-white p-5 shadow-sm">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                                    <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest ${page.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                                        {page.status}
                                                    </span>
                                                    <span className="bg-slate-50 px-2 py-1 font-mono text-[9px] font-black uppercase tracking-widest text-slate-500">/{page.slug}</span>
                                                </div>
                                                <h3 className="truncate text-xl font-black uppercase tracking-tight text-[#282c3f]">{page.title}</h3>
                                                <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-500">{stripHtml(page.content || 'No content yet.')}</p>
                                            </div>
                                            <div className="flex shrink-0 gap-2">
                                                <button type="button" onClick={() => openEditPage(page)} className="bg-slate-100 p-2 text-slate-600 hover:bg-[#282c3f] hover:text-white" title="Edit page">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button type="button" onClick={() => toggleStatus(page.id, 'pages')} className="bg-slate-100 p-2 text-slate-600 hover:bg-[#282c3f] hover:text-white" title="Publish or draft">
                                                    {page.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                                <button type="button" onClick={() => deletePage(page)} className="bg-red-50 p-2 text-red-500 hover:bg-red-500 hover:text-white" title="Delete page">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 md:grid-cols-2">
                                            <span>SEO: {page.meta_title ? 'Configured' : 'Missing title'}</span>
                                            <a href={`/page/${page.slug}`} target="_blank" rel="noreferrer" className="text-[#ff3f6c] hover:text-[#282c3f] md:text-right">
                                                Preview /page/{page.slug}
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {tabData.length === 0 && <EmptyState icon={FileText} text="No Static Pages Added Yet" />}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <form id="settings-settings" onSubmit={handleSettingsSubmit} className="max-w-4xl space-y-8">
                            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div className="border-b border-gray-100 pb-6">
                                    <h2 className="mb-1 text-lg font-black uppercase tracking-wider text-[#282c3f]">Global Brand & Layout</h2>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Controls the logo, navbar, footer, social links, payment labels, and reusable storefront text.</p>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <InputField
                                        label="Brand Name"
                                        value={settingsData.site_brand_name}
                                        onChange={(e) => setSettingsData('site_brand_name', e.target.value)}
                                        error={settingsErrors.site_brand_name}
                                        placeholder="IHO STUDIO"
                                    />
                                    <InputField
                                        label="Logo Text Mark"
                                        value={settingsData.site_logo_mark}
                                        onChange={(e) => setSettingsData('site_logo_mark', e.target.value)}
                                        error={settingsErrors.site_logo_mark}
                                        placeholder="IHO"
                                    />
                                    <InputField
                                        label="Tagline"
                                        value={settingsData.site_tagline}
                                        onChange={(e) => setSettingsData('site_tagline', e.target.value)}
                                        error={settingsErrors.site_tagline}
                                        placeholder="Performance Store"
                                    />
                                </div>

                                <div className="mt-5 space-y-1.5">
                                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Website Logo</label>
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setSettingsData('site_logo', e.target.files[0])}
                                            className="w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-bold text-[#282c3f]"
                                        />
                                        {tabData?.site_logo && (
                                            <div className="grid h-16 w-28 shrink-0 place-items-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                                                <img src={`/storage/${tabData.site_logo}`} alt="Current logo" className="h-full w-full object-contain p-2" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="ml-1 mt-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">Leave empty to keep current logo. If no logo is uploaded, the text mark is used.</p>
                                    {settingsErrors.site_logo && <p className="ml-1 text-[10px] font-bold text-red-500">{settingsErrors.site_logo}</p>}
                                </div>

                                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {[
                                        ['nav_mobile_title', 'Mobile Menu Title', 'Studio Menu'],
                                        ['nav_search_placeholder', 'Search Placeholder', 'SEARCH FOR RUNNING GEAR, GYM WEAR...'],
                                        ['nav_promo_eyebrow', 'Mega Menu Promo Eyebrow', 'IHO Style Days'],
                                        ['nav_promo_title', 'Mega Menu Promo Title', 'Fresh drops, sharper deals'],
                                        ['nav_promo_cta', 'Mega Menu Promo Button', 'Explore'],
                                        ['nav_promo_link', 'Mega Menu Promo Link', '/shop?sort=newest'],
                                        ['footer_newsletter_title', 'Footer Newsletter Title', 'Get Style Updates'],
                                        ['footer_newsletter_placeholder', 'Footer Newsletter Placeholder', 'Enter your email for early access'],
                                        ['footer_copyright', 'Footer Copyright', 'Copyright 2026 IHO STUDIO. ALL RIGHTS RESERVED.'],
                                    ].map(([key, label, placeholder]) => (
                                        <InputField
                                            key={key}
                                            label={label}
                                            value={settingsData[key]}
                                            onChange={(e) => setSettingsData(key, e.target.value)}
                                            error={settingsErrors[key]}
                                            placeholder={placeholder}
                                        />
                                    ))}
                                </div>

                                <div className="mt-5 space-y-1.5">
                                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Footer About Text</label>
                                    <textarea
                                        value={settingsData.footer_about_text}
                                        onChange={(e) => setSettingsData('footer_about_text', e.target.value)}
                                        rows="3"
                                        className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-bold text-[#282c3f] outline-none transition-all focus:ring-2 focus:ring-[#ff3f6c]"
                                        placeholder="Short brand description shown in the footer."
                                    />
                                    {settingsErrors.footer_about_text && <p className="ml-1 text-[10px] font-bold text-red-500">{settingsErrors.footer_about_text}</p>}
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-5">
                                    {[
                                        ['nav_trending_searches_json', 'Trending Searches JSON', '["oversized t-shirts","gym joggers","running shorts"]'],
                                        ['nav_links_json', 'Navbar Links JSON', '[{"name":"Home","href":"/"},{"name":"Men","href":"/shop?gender=men"}]'],
                                        ['nav_mega_menu_json', 'Mega Menu JSON', '{"Men":[{"title":"Topwear","links":[["T-Shirts","/shop?gender=men&subcategory=t-shirts"]]}]}'],
                                        ['footer_link_groups_json', 'Footer Link Groups JSON', '[{"title":"Shop","links":[{"label":"All Products","href":"/shop"}]}]'],
                                        ['footer_trust_badges_json', 'Footer Trust Badges JSON', '[{"icon":"truck","title":"Fast Shipping","desc":"Quick dispatch network"}]'],
                                        ['footer_social_links_json', 'Footer Social Links JSON', '[{"icon":"instagram","label":"Instagram","href":"https://instagram.com/"}]'],
                                        ['footer_payment_methods_json', 'Footer Payment Methods JSON', '["VISA","MASTER","UPI","COD"]'],
                                        ['footer_bottom_links_json', 'Footer Bottom Links JSON', '[{"label":"Privacy","href":"/privacy-policy"}]'],
                                    ].map(([key, label, placeholder]) => (
                                        <JsonTextArea
                                            key={key}
                                            label={label}
                                            value={settingsData[key]}
                                            onChange={(e) => setSettingsData(key, e.target.value)}
                                            error={settingsErrors[key]}
                                            placeholder={placeholder}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div className="border-b border-gray-100 pb-6">
                                    <h2 className="text-lg font-black text-[#282c3f] uppercase tracking-wider mb-1">Homepage Storefront Content</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Controls the premium landing page hero, rails, trust blocks, reviews, offers, and franchise CTA.</p>
                                </div>

                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField
                                        label="Homepage SEO Title"
                                        value={settingsData.home_seo_title}
                                        onChange={(e) => setSettingsData('home_seo_title', e.target.value)}
                                        error={settingsErrors.home_seo_title}
                                        placeholder="IHO STUDIO | Performance Luxury"
                                    />
                                    <InputField
                                        label="Top Sale Strip"
                                        value={settingsData.home_top_strip}
                                        onChange={(e) => setSettingsData('home_top_strip', e.target.value)}
                                        error={settingsErrors.home_top_strip}
                                        placeholder="FLAT 40-70% OFF | FREE SHIPPING ABOVE RS 999"
                                    />
                                    <InputField
                                        label="Hero Badge"
                                        value={settingsData.home_hero_badge}
                                        onChange={(e) => setSettingsData('home_hero_badge', e.target.value)}
                                        error={settingsErrors.home_hero_badge}
                                        placeholder="IHO Studio Performance Store"
                                    />
                                    <InputField
                                        label="Hero Title"
                                        value={settingsData.home_hero_title}
                                        onChange={(e) => setSettingsData('home_hero_title', e.target.value)}
                                        error={settingsErrors.home_hero_title}
                                        placeholder="Sportswear Built For Motion"
                                    />
                                    <InputField
                                        label="Hero Media Alt Text"
                                        value={settingsData.home_hero_media_alt}
                                        onChange={(e) => setSettingsData('home_hero_media_alt', e.target.value)}
                                        error={settingsErrors.home_hero_media_alt}
                                        placeholder="Hero model image alt text"
                                    />
                                </div>

                                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InputField
                                        label="Sale Badge Title"
                                        value={settingsData.home_sale_title}
                                        onChange={(e) => setSettingsData('home_sale_title', e.target.value)}
                                        error={settingsErrors.home_sale_title}
                                        placeholder="50-80% OFF"
                                    />
                                    <InputField
                                        label="Sale Badge Subtitle"
                                        value={settingsData.home_sale_subtitle}
                                        onChange={(e) => setSettingsData('home_sale_subtitle', e.target.value)}
                                        error={settingsErrors.home_sale_subtitle}
                                        placeholder="On latest active storefront picks"
                                    />
                                    <InputField
                                        label="Coupon Strip Text"
                                        value={settingsData.home_coupon_text}
                                        onChange={(e) => setSettingsData('home_coupon_text', e.target.value)}
                                        error={settingsErrors.home_coupon_text}
                                        placeholder="Use code IHOSTYLE for extra savings"
                                    />
                                </div>

                                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField
                                        label="Hide Homepage Sections"
                                        value={settingsData.home_hidden_sections}
                                        onChange={(e) => setSettingsData('home_hidden_sections', e.target.value)}
                                        error={settingsErrors.home_hidden_sections}
                                        placeholder="example: reviews,franchise"
                                    />
                                    <InputField
                                        label="Homepage Section Order"
                                        value={settingsData.home_section_order}
                                        onChange={(e) => setSettingsData('home_section_order', e.target.value)}
                                        error={settingsErrors.home_section_order}
                                        placeholder="hero,promo,categories,best,new,gym,offers,reviews,trust,franchise"
                                    />
                                    <InputField
                                        label="Products Per Homepage Section"
                                        type="number"
                                        min="1"
                                        max="8"
                                        value={settingsData.home_product_section_count}
                                        onChange={(e) => setSettingsData('home_product_section_count', e.target.value)}
                                        error={settingsErrors.home_product_section_count}
                                        placeholder="4"
                                    />
                                </div>
                                <p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                                    Section IDs: hero, promo, categories, best, new, gym, offers, reviews, trust, franchise.
                                </p>

                                <div className="mt-5 space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hero Subtitle</label>
                                    <textarea
                                        value={settingsData.home_hero_subtitle}
                                        onChange={(e) => setSettingsData('home_hero_subtitle', e.target.value)}
                                        rows="3"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] focus:ring-2 focus:ring-[#ff3f6c] outline-none transition-all resize-none"
                                        placeholder="Premium training, running, and daily performance essentials."
                                    />
                                    {settingsErrors.home_hero_subtitle && <p className="text-[10px] text-red-500 font-bold ml-1">{settingsErrors.home_hero_subtitle}</p>}
                                </div>

                                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField
                                        label="Primary CTA Text"
                                        value={settingsData.home_hero_cta_text}
                                        onChange={(e) => setSettingsData('home_hero_cta_text', e.target.value)}
                                        error={settingsErrors.home_hero_cta_text}
                                        placeholder="Shop Collection"
                                    />
                                    <InputField
                                        label="Primary CTA Link"
                                        value={settingsData.home_hero_cta_link}
                                        onChange={(e) => setSettingsData('home_hero_cta_link', e.target.value)}
                                        error={settingsErrors.home_hero_cta_link}
                                        placeholder="/shop"
                                    />
                                    <InputField
                                        label="Secondary CTA Text"
                                        value={settingsData.home_hero_secondary_text}
                                        onChange={(e) => setSettingsData('home_hero_secondary_text', e.target.value)}
                                        error={settingsErrors.home_hero_secondary_text}
                                        placeholder="Apply Franchise"
                                    />
                                    <InputField
                                        label="Secondary CTA Link"
                                        value={settingsData.home_hero_secondary_link}
                                        onChange={(e) => setSettingsData('home_hero_secondary_link', e.target.value)}
                                        error={settingsErrors.home_hero_secondary_link}
                                        placeholder="/franchise-enquiry"
                                    />
                                </div>

                                <div className="mt-5 space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hero Background Media</label>
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                        <input
                                            type="file"
                                            accept="image/*,video/mp4,video/webm"
                                            onChange={(e) => setSettingsData('home_hero_media', e.target.files[0])}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-[#282c3f] cursor-pointer"
                                        />
                                        {tabData?.home_hero_media && (
                                            <div className="h-16 w-28 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                                <img src={`/storage/${tabData.home_hero_media}`} alt="Current homepage hero media" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1 mt-1">Leave empty to keep current media. The storefront shows a blank placeholder until media is uploaded.</p>
                                    {settingsErrors.home_hero_media && <p className="text-[10px] text-red-500 font-bold ml-1">{settingsErrors.home_hero_media}</p>}
                                </div>

                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        ['home_categories_title', 'Featured Categories Title'],
                                        ['home_categories_subtitle', 'Featured Categories Subtitle'],
                                        ['home_best_sellers_title', 'Best Sellers Title'],
                                        ['home_best_sellers_subtitle', 'Best Sellers Subtitle'],
                                        ['home_new_arrivals_title', 'New Arrivals Title'],
                                        ['home_new_arrivals_subtitle', 'New Arrivals Subtitle'],
                                        ['home_gym_title', 'Gym Products Title'],
                                        ['home_gym_subtitle', 'Gym Products Subtitle'],
                                        ['home_offers_title', 'Offers Title'],
                                        ['home_offers_subtitle', 'Offers Subtitle'],
                                        ['home_reviews_title', 'Reviews Title'],
                                        ['home_reviews_subtitle', 'Reviews Subtitle'],
                                        ['home_trust_title', 'Trust Section Title'],
                                        ['home_trust_subtitle', 'Trust Section Subtitle'],
                                        ['home_franchise_title', 'Franchise CTA Title'],
                                        ['home_franchise_cta_text', 'Franchise CTA Button'],
                                        ['home_franchise_cta_link', 'Franchise CTA Link'],
                                    ].map(([key, label]) => (
                                        <InputField
                                            key={key}
                                            label={label}
                                            value={settingsData[key]}
                                            onChange={(e) => setSettingsData(key, e.target.value)}
                                            error={settingsErrors[key]}
                                        />
                                    ))}
                                </div>

                                <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-5">
                                    <h3 className="mb-5 text-xs font-black uppercase tracking-[0.25em] text-[#282c3f]">Footer Ad Strip</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <InputField
                                            label="Footer Ad Text"
                                            value={settingsData.footer_ad_text}
                                            onChange={(e) => setSettingsData('footer_ad_text', e.target.value)}
                                            error={settingsErrors.footer_ad_text}
                                            placeholder="Leave empty to hide footer ad"
                                        />
                                        <InputField
                                            label="Footer Ad Button"
                                            value={settingsData.footer_ad_cta}
                                            onChange={(e) => setSettingsData('footer_ad_cta', e.target.value)}
                                            error={settingsErrors.footer_ad_cta}
                                            placeholder="Shop Deals"
                                        />
                                        <InputField
                                            label="Footer Ad Link"
                                            value={settingsData.footer_ad_href}
                                            onChange={(e) => setSettingsData('footer_ad_href', e.target.value)}
                                            error={settingsErrors.footer_ad_href}
                                            placeholder="/shop?discount=40"
                                        />
                                    </div>
                                </div>

                                <div className="mt-5 space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Franchise CTA Subtitle</label>
                                    <textarea
                                        value={settingsData.home_franchise_subtitle}
                                        onChange={(e) => setSettingsData('home_franchise_subtitle', e.target.value)}
                                        rows="3"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] focus:ring-2 focus:ring-[#ff3f6c] outline-none transition-all resize-none"
                                    />
                                    {settingsErrors.home_franchise_subtitle && <p className="text-[10px] text-red-500 font-bold ml-1">{settingsErrors.home_franchise_subtitle}</p>}
                                </div>

                                <BenefitEditor
                                    value={settingsData.home_benefits_json}
                                    onChange={(value) => setSettingsData('home_benefits_json', value)}
                                    error={settingsErrors.home_benefits_json}
                                />

                                <PromoTileEditor
                                    value={settingsData.home_promo_tiles_json}
                                    onChange={(value) => setSettingsData('home_promo_tiles_json', value)}
                                    error={settingsErrors.home_promo_tiles_json}
                                />

                                <div className="mt-5 space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category Card Offers JSON</label>
                                    <textarea
                                        value={settingsData.home_category_offers_json}
                                        onChange={(e) => setSettingsData('home_category_offers_json', e.target.value)}
                                        rows="4"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-xs font-bold text-[#282c3f] focus:ring-2 focus:ring-[#ff3f6c] outline-none transition-all resize-none"
                                        placeholder='[{"title":"Mens Activewear","discount":"Studio Picks","href":"/shop?category=men-sportswear"}]'
                                    />
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Optional. Items match category cards by position.</p>
                                    {settingsErrors.home_category_offers_json && <p className="text-[10px] text-red-500 font-bold ml-1">{settingsErrors.home_category_offers_json}</p>}
                                </div>
                            </div>

                            <div className="border-b border-gray-100 pb-6">
                                <h2 className="text-lg font-black text-[#282c3f] uppercase tracking-wider mb-1">Shop Page Configuration</h2>
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
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] focus:ring-2 focus:ring-[#ff3f6c] outline-none transition-all resize-none"
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
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-[#282c3f] cursor-pointer"
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
                                <button disabled={settingsProcessing} type="submit" className="bg-[#282c3f] text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#ff3f6c] transition-colors flex items-center gap-2 disabled:opacity-50">
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
                                        <h3 className="text-xl font-black uppercase tracking-tight text-[#282c3f]">Gym Wear Content</h3>
                                        <p className="mt-1 text-xs font-bold text-slate-500">Controls the Gym Wear collection banner and customer-facing description on the Shop page.</p>
                                    </div>
                                    <Dumbbell className="text-[#ff3f6c]" size={28} />
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
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] outline-none resize-none"
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
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] outline-none resize-none"
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
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-[#282c3f]"
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
                                    <a href="/franchise-superadmin/products?subcategory=gym-wear" className="border border-slate-200 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#282c3f] hover:border-[#282c3f]">
                                        Edit Gym Products
                                    </a>
                                    <button
                                        disabled={gymWearForm.processing}
                                        type="submit"
                                        className="bg-[#282c3f] px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-white transition-colors hover:bg-[#ff3f6c] disabled:opacity-60"
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
                                        <h3 className="text-xl font-black uppercase tracking-tight text-[#282c3f]">Shop Page Content</h3>
                                        <p className="mt-1 text-xs font-bold text-slate-500">These fields control the hero and promo text on the public Shop page.</p>
                                    </div>
                                    <ShoppingBag className="text-[#ff3f6c]" size={28} />
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
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] outline-none resize-none"
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
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-[#282c3f]"
                                    />
                                    {tabData?.shop_hero_bg_image && (
                                        <p className="text-[10px] font-bold text-gray-400 ml-1">Current image: {tabData.shop_hero_bg_image}</p>
                                    )}
                                    {shopForm.errors.shop_hero_bg_image && <p className="text-[10px] text-red-500 font-bold ml-1">{shopForm.errors.shop_hero_bg_image}</p>}
                                </div>

                                <button
                                    disabled={shopForm.processing}
                                    type="submit"
                                    className="mt-7 bg-[#282c3f] px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-white transition-colors hover:bg-[#ff3f6c] disabled:opacity-60"
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
                                    <h2 className="text-lg font-black uppercase tracking-wider text-[#282c3f]">Homepage Featured Categories</h2>
                                    <p className="text-xs font-bold text-gray-400">Controls the public “The Collections” section. Cards appear by sort order.</p>
                                </div>
                                <button onClick={openCreateFeaturedCategory} className="flex items-center justify-center gap-2 bg-[#282c3f] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#ff3f6c]">
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
                                            <div className="absolute left-4 top-4 bg-white/95 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#282c3f]">
                                                Order {category.sort_order}
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <div className="mb-5 flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="text-lg font-black uppercase tracking-tight text-[#282c3f]">{category.name}</h3>
                                                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">/{category.slug}</p>
                                                </div>
                                                <span className={`shrink-0 px-2 py-1 text-[9px] font-black uppercase tracking-widest ${category.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                                    {category.is_active ? 'Active' : 'Hidden'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
                                                <button onClick={() => openEditFeaturedCategory(category)} className="bg-gray-100 p-2 text-gray-600 hover:bg-[#282c3f] hover:text-white" title="Edit featured category">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button onClick={() => toggleFeaturedCategory(category)} className="bg-gray-100 p-2 text-gray-600 hover:bg-[#282c3f] hover:text-white" title="Show or hide featured category">
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
                                <div key={review.id} className={`bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between transition-colors ${review.status === 'inactive' ? 'opacity-60 bg-gray-50' : 'hover:border-[#282c3f]/20'}`}>
                                    <div className="mb-4 flex justify-between items-start gap-4 border-b border-gray-100 pb-4">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="font-black text-[#282c3f] uppercase">{review.customer_name}</h4>
                                                {review.is_dummy && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest rounded bg-amber-50 px-2 py-1 text-amber-600">Dummy</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                Product: <span className="text-[#ff3f6c]">{review.product_purchased || 'N/A'}</span>
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
                                            <button onClick={() => openEditTestimonial(review)} className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-[#282c3f] hover:text-white transition-colors" title="Edit review">
                                                <Edit3 size={16} />
                                            </button>
                                            <button onClick={() => toggleStatus(review.id, 'testimonials')} className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-[#282c3f] hover:text-white transition-colors" title="Show or hide review">
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
                {isBannerModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#282c3f]/60 p-4 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-3xl overflow-hidden bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-gray-100 bg-white p-6">
                                <div>
                                    <h3 className="flex items-center gap-2 font-black uppercase tracking-wider text-[#282c3f]">
                                        <ImageIcon size={18} className="text-[#ff3f6c]" /> Add Storefront Banner
                                    </h3>
                                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Upload desktop and mobile artwork for responsive website campaigns.</p>
                                </div>
                                <button type="button" onClick={closeBannerModal} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleBannerSubmit} className="space-y-5 p-6">
                                <InputField
                                    label="Campaign Title *"
                                    value={bannerForm.data.title}
                                    onChange={(e) => bannerForm.setData('title', e.target.value)}
                                    error={bannerForm.errors.title}
                                    placeholder="Summer Sale 2026"
                                    required
                                />

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Placement *</label>
                                        <select value={bannerForm.data.placement_type} onChange={(e) => bannerForm.setData('placement_type', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-bold text-[#282c3f] outline-none focus:ring-2 focus:ring-[#ff3f6c]">
                                            <option value="main_hero_slider">Main Hero Slider</option>
                                            <option value="mid_page_banner">Mid Page Banner</option>
                                            <option value="category_banner">Category Collection</option>
                                        </select>
                                        {bannerForm.errors.placement_type && <p className="ml-1 text-[10px] font-bold text-red-500">{bannerForm.errors.placement_type}</p>}
                                    </div>

                                    <InputField
                                        label="Target URL"
                                        value={bannerForm.data.target_url}
                                        onChange={(e) => bannerForm.setData('target_url', e.target.value)}
                                        error={bannerForm.errors.target_url}
                                        placeholder="/shop?category=gym-wear"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <BannerUploadField
                                        label="Desktop Banner *"
                                        hint="Recommended wide artwork"
                                        file={bannerForm.data.desktop_image}
                                        error={bannerForm.errors.desktop_image}
                                        onChange={(file) => bannerForm.setData('desktop_image', file)}
                                    />
                                    <BannerUploadField
                                        label="Mobile Banner *"
                                        hint="Recommended portrait or square crop"
                                        file={bannerForm.data.mobile_image}
                                        error={bannerForm.errors.mobile_image}
                                        onChange={(file) => bannerForm.setData('mobile_image', file)}
                                    />
                                </div>

                                <div className="flex flex-col-reverse justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row">
                                    <button type="button" onClick={closeBannerModal} className="border border-slate-200 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-[#282c3f] hover:text-[#282c3f]">
                                        Cancel
                                    </button>
                                    <button disabled={bannerForm.processing} type="submit" className="inline-flex items-center justify-center gap-2 bg-[#282c3f] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[#ff3f6c] disabled:opacity-50">
                                        <Upload size={15} /> {bannerForm.processing ? 'Publishing...' : 'Publish Banner'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isPageModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#282c3f]/60 p-4 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="max-h-[92vh] w-full max-w-5xl overflow-y-auto bg-white shadow-2xl">
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-6">
                                <div>
                                    <h3 className="flex items-center gap-2 font-black uppercase tracking-wider text-[#282c3f]">
                                        <FileText size={18} className="text-[#ff3f6c]" /> {editingPage ? 'Edit Static Page' : 'Create Static Page'}
                                    </h3>
                                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Published pages are available at /page/slug and supported fixed links.</p>
                                </div>
                                <button type="button" onClick={closePageModal} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
                            </div>

                            <form onSubmit={handlePageSubmit} className="space-y-6 p-6">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                    <InputField
                                        label="Page Title *"
                                        value={pageForm.data.title}
                                        onChange={(e) => {
                                            pageForm.setData('title', e.target.value);
                                            if (!editingPage && !pageForm.data.slug) {
                                                pageForm.setData('slug', slugify(e.target.value));
                                            }
                                        }}
                                        error={pageForm.errors.title}
                                        placeholder="Shipping Policy"
                                        required
                                    />
                                    <InputField
                                        label="URL Slug *"
                                        value={pageForm.data.slug}
                                        onChange={(e) => pageForm.setData('slug', slugify(e.target.value))}
                                        error={pageForm.errors.slug}
                                        placeholder="shipping"
                                        required
                                    />
                                    <div className="space-y-1.5">
                                        <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</label>
                                        <select value={pageForm.data.status} onChange={(e) => pageForm.setData('status', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-bold text-[#282c3f] outline-none focus:ring-2 focus:ring-[#ff3f6c]">
                                            <option value="published">Published</option>
                                            <option value="draft">Draft</option>
                                        </select>
                                        {pageForm.errors.status && <p className="ml-1 text-[10px] font-bold text-red-500">{pageForm.errors.status}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <InputField
                                        label="SEO Meta Title"
                                        value={pageForm.data.meta_title}
                                        onChange={(e) => pageForm.setData('meta_title', e.target.value)}
                                        error={pageForm.errors.meta_title}
                                        placeholder="Shipping Policy | IHO STUDIO"
                                    />
                                    <InputField
                                        label="SEO Meta Description"
                                        value={pageForm.data.meta_description}
                                        onChange={(e) => pageForm.setData('meta_description', e.target.value)}
                                        error={pageForm.errors.meta_description}
                                        placeholder="Short summary for search engines"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                                        <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Page Content *</label>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Supports plain text or simple HTML like h2, p, ul, strong.</span>
                                    </div>
                                    <textarea
                                        value={pageForm.data.content}
                                        onChange={(e) => pageForm.setData('content', e.target.value)}
                                        rows="14"
                                        className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm font-bold leading-7 text-[#282c3f] outline-none transition-all focus:ring-2 focus:ring-[#ff3f6c]"
                                        placeholder="<h2>Policy Heading</h2><p>Write your page content here.</p>"
                                    />
                                    {pageForm.errors.content && <p className="ml-1 text-[10px] font-bold text-red-500">{pageForm.errors.content}</p>}
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live URL</p>
                                    <p className="mt-2 font-mono text-sm font-black text-[#282c3f]">/page/{pageForm.data.slug || 'your-page-slug'}</p>
                                    {['shipping', 'returns', 'privacy-policy', 'terms', 'cancellation', 'support'].includes(pageForm.data.slug) && (
                                        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#ff3f6c]">This slug also powers the matching main footer/static route.</p>
                                    )}
                                </div>

                                <div className="flex flex-col-reverse justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row">
                                    <button type="button" onClick={closePageModal} className="border border-slate-200 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-[#282c3f] hover:text-[#282c3f]">
                                        Cancel
                                    </button>
                                    <button disabled={pageForm.processing} type="submit" className="bg-[#282c3f] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[#ff3f6c] disabled:opacity-50">
                                        {pageForm.processing ? 'Saving...' : editingPage ? 'Update Page' : 'Create Page'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isTestimonialModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#282c3f]/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
                            <div className="bg-white p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-black text-[#282c3f] uppercase tracking-wider flex items-center gap-2">
                                    <MessageSquare size={18} className="text-[#ff3f6c]" /> {editingTestimonial ? 'Edit Customer Review' : 'Add Customer Review'}
                                </h3>
                                <button type="button" onClick={closeTestimonialModal} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleTestimonialSubmit} className="p-6 space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <InputField label="Customer Name *" value={data.customer_name} onChange={(e) => setData('customer_name', e.target.value)} error={errors.customer_name} required />
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Star Rating</label>
                                        <select value={data.rating} onChange={(e) => setData('rating', parseInt(e.target.value, 10))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] outline-none">
                                            {[5, 4, 3, 2, 1].map((num) => <option key={num} value={num}>{num} Stars</option>)}
                                        </select>
                                    </div>
                                </div>

                                <InputField label="Product Purchased (Optional)" value={data.product_purchased} onChange={(e) => setData('product_purchased', e.target.value)} error={errors.product_purchased} placeholder="e.g. Titanium Aero-Weave Tee" />

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Review Text *</label>
                                    <textarea value={data.review_text} onChange={(e) => setData('review_text', e.target.value)} rows="3" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] outline-none resize-none" required placeholder="What did the customer say?"></textarea>
                                    {errors.review_text && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.review_text}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Customer Image (Optional)</label>
                                    <input type="file" accept="image/*" onChange={(e) => setData('image', e.target.files[0])} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-[#282c3f]" />
                                    {editingTestimonial?.image_path && <p className="text-[10px] font-bold text-gray-400 ml-1">Leave empty to keep current image.</p>}
                                </div>

                                <button disabled={processing} type="submit" className="w-full bg-[#282c3f] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#ff3f6c] transition-colors mt-4">
                                    {processing ? 'Saving...' : editingTestimonial ? 'Update Review' : 'Publish Review'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isFeaturedCategoryModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#282c3f]/60 p-4 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl overflow-hidden bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-gray-100 bg-white p-6">
                                <h3 className="flex items-center gap-2 font-black uppercase tracking-wider text-[#282c3f]">
                                    <Tags size={18} className="text-[#ff3f6c]" /> {editingFeaturedCategory ? 'Edit Featured Category' : 'Add Featured Category'}
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

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <InputField
                                        label="Sort Order"
                                        type="number"
                                        min="0"
                                        value={featuredCategoryForm.data.sort_order}
                                        onChange={(e) => featuredCategoryForm.setData('sort_order', e.target.value)}
                                        error={featuredCategoryForm.errors.sort_order}
                                    />
                                    <div className="space-y-1.5">
                                        <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Style Theme</label>
                                        <select
                                            value={featuredCategoryForm.data.style_theme}
                                            onChange={(e) => featuredCategoryForm.setData('style_theme', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] outline-none focus:ring-2 focus:ring-[#ff3f6c]"
                                        >
                                            <option value="default">Default (Dark)</option>
                                            <option value="minimal">Minimal Light</option>
                                            <option value="bold">Bold & Vibrant</option>
                                            <option value="mono">Monochrome</option>
                                            <option value="gradient">Gradient Mesh</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Accent Color (Hex)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={featuredCategoryForm.data.accent_color || '#ff3f6c'}
                                                onChange={(e) => featuredCategoryForm.setData('accent_color', e.target.value)}
                                                className="h-11 w-14 cursor-pointer border border-gray-200 rounded-xl bg-gray-50"
                                            />
                                            <input
                                                type="text"
                                                value={featuredCategoryForm.data.accent_color}
                                                onChange={(e) => featuredCategoryForm.setData('accent_color', e.target.value)}
                                                placeholder="#ff3f6c"
                                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] outline-none focus:ring-2 focus:ring-[#ff3f6c]"
                                            />
                                        </div>
                                        {featuredCategoryForm.errors.accent_color && (
                                            <p className="text-[10px] font-bold text-red-500 ml-1">{featuredCategoryForm.errors.accent_color}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Card Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFeaturedCategoryImageChange}
                                        className="w-full bg-gray-50 border border-gray-200 px-4 py-2 text-sm font-bold text-[#282c3f]"
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

                                <div className="space-y-1.5">
                                    <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Collection Banner Image (Optional - Wide)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => featuredCategoryForm.setData('banner_image', e.target.files[0] || null)}
                                        className="w-full bg-gray-50 border border-gray-200 px-4 py-2 text-sm font-bold text-[#282c3f]"
                                    />
                                    {editingFeaturedCategory?.banner_image_url && (
                                        <div className="mt-3 flex items-center gap-3">
                                            <img src={editingFeaturedCategory.banner_image_url} alt="Banner preview" className="h-16 w-36 object-cover" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Current banner. Leave empty to keep it.</p>
                                        </div>
                                    )}
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Appears as a unique background in each collection card.</p>
                                    {featuredCategoryForm.errors.banner_image && (
                                        <p className="ml-1 text-[10px] font-bold text-red-500">{featuredCategoryForm.errors.banner_image}</p>
                                    )}
                                </div>

                                <button disabled={featuredCategoryForm.processing} type="submit" className="w-full bg-[#282c3f] py-4 font-black uppercase tracking-widest text-white transition-colors hover:bg-[#ff3f6c] disabled:opacity-50">
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
                <h4 className="text-2xl font-black text-[#282c3f]">{value}</h4>
            </div>
            <div className={`size-12 rounded-2xl flex items-center justify-center bg-gray-50 ${color}`}><Icon size={20} strokeWidth={2.5} /></div>
        </div>
    );
}

function EmptyState({ icon: Icon, text }) {
    return (
        <div className="col-span-full py-16 text-center">
            <Icon size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1} />
            <p className="text-[#282c3f] font-black text-lg">{text}</p>
        </div>
    );
}

function slugify(value) {
    return String(value || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function stripHtml(value) {
    return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function BannerUploadField({ label, hint, file, error, onChange }) {
    return (
        <label className="relative block cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-5 text-center transition-colors hover:bg-gray-100">
            <input type="file" accept="image/*" onChange={(e) => onChange(e.target.files[0] || null)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
            <ImageIcon size={24} className="mx-auto mb-3 text-gray-400" />
            <p className="text-[10px] font-black uppercase tracking-widest text-[#282c3f]">{label}</p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">{file ? file.name : hint}</p>
            {error && <p className="mt-2 text-[10px] font-bold text-red-500">{error}</p>}
        </label>
    );
}

function InputField({ label, error, ...props }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#282c3f] focus:ring-2 focus:ring-[#ff3f6c] outline-none transition-all" {...props} />
            {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
        </div>
    );
}

function JsonTextArea({ label, error, ...props }) {
    return (
        <div className="space-y-1.5">
            <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</label>
            <textarea
                rows="4"
                className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-xs font-bold text-[#282c3f] outline-none transition-all focus:ring-2 focus:ring-[#ff3f6c]"
                {...props}
            />
            <p className="ml-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">Optional advanced control. Leave empty to use the site default.</p>
            {error && <p className="ml-1 text-[10px] font-bold text-red-500">{error}</p>}
        </div>
    );
}

function parseEditorRows(value, fallback) {
    if (!value) return fallback;

    try {
        const decoded = JSON.parse(value);
        return Array.isArray(decoded) && decoded.length ? decoded : fallback;
    } catch {
        return fallback;
    }
}

function PromoTileEditor({ value, onChange, error }) {
    const fallback = [
        { title: 'Min. 50% Off', subtitle: 'Performance Tees', href: '/shop', from: '#ff3f6c', to: '#ff905a' },
        { title: 'Buy 2 Save More', subtitle: 'Gym Essentials', href: '/shop?category=gym-wear', from: '#14b8a6', to: '#2563eb' },
        { title: 'New Season', subtitle: 'Running Gear', href: '/shop?category=running-wear', from: '#f59e0b', to: '#ef4444' },
    ];
    const [rows, setRows] = useState(() => parseEditorRows(value, fallback));

    useEffect(() => {
        setRows(parseEditorRows(value, fallback));
    }, [value]);

    const updateRows = (nextRows) => {
        setRows(nextRows);
        onChange(JSON.stringify(nextRows));
    };

    return (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#282c3f]">Homepage Promo Tiles</h3>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Editable cards below the hero.</p>
                </div>
                <button type="button" onClick={() => updateRows([...rows, { title: '', subtitle: '', href: '/shop', from: '#ff3f6c', to: '#ff905a' }])} className="bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#282c3f] shadow-sm hover:text-[#ff3f6c]">
                    Add Tile
                </button>
            </div>

            <div className="space-y-4">
                {rows.map((row, index) => (
                    <div key={`promo-tile-${index}`} className="grid gap-3 bg-white p-4 md:grid-cols-6">
                        {['title', 'subtitle', 'href', 'from', 'to'].map((field) => (
                            <input
                                key={field}
                                value={row[field] || ''}
                                onChange={(e) => {
                                    const nextRows = rows.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: e.target.value } : item);
                                    updateRows(nextRows);
                                }}
                                placeholder={field}
                                className="bg-gray-50 border border-gray-200 px-3 py-2 text-xs font-bold text-[#282c3f] outline-none focus:ring-2 focus:ring-[#ff3f6c] md:col-span-1"
                            />
                        ))}
                        <button type="button" onClick={() => updateRows(rows.filter((_, itemIndex) => itemIndex !== index))} className="bg-red-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white">
                            Remove
                        </button>
                    </div>
                ))}
            </div>
            {error && <p className="mt-2 text-[10px] font-bold text-red-500">{error}</p>}
        </div>
    );
}

function BenefitEditor({ value, onChange, error }) {
    const fallback = [
        { title: 'Easy Returns', body: 'Simple exchange and return support.' },
        { title: 'Fast Shipping', body: 'Quick dispatch for active catalog products.' },
        { title: 'Secure Checkout', body: 'Protected payments and account handling.' },
        { title: 'Fresh Drops', body: 'New styles and offers keep the store moving.' },
    ];
    const [rows, setRows] = useState(() => parseEditorRows(value, fallback));

    useEffect(() => {
        setRows(parseEditorRows(value, fallback));
    }, [value]);

    const updateRows = (nextRows) => {
        setRows(nextRows);
        onChange(JSON.stringify(nextRows));
    };

    return (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#282c3f]">Trust Benefit Cards</h3>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Shown in the assurance section.</p>
                </div>
                <button type="button" onClick={() => updateRows([...rows, { title: '', body: '' }])} className="bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#282c3f] shadow-sm hover:text-[#ff3f6c]">
                    Add Card
                </button>
            </div>

            <div className="space-y-4">
                {rows.map((row, index) => (
                    <div key={`benefit-card-${index}`} className="grid gap-3 bg-white p-4 md:grid-cols-[1fr_2fr_auto]">
                        <input
                            value={row.title || ''}
                            onChange={(e) => updateRows(rows.map((item, itemIndex) => itemIndex === index ? { ...item, title: e.target.value } : item))}
                            placeholder="Title"
                            className="bg-gray-50 border border-gray-200 px-3 py-2 text-xs font-bold text-[#282c3f] outline-none focus:ring-2 focus:ring-[#ff3f6c]"
                        />
                        <input
                            value={row.body || ''}
                            onChange={(e) => updateRows(rows.map((item, itemIndex) => itemIndex === index ? { ...item, body: e.target.value } : item))}
                            placeholder="Description"
                            className="bg-gray-50 border border-gray-200 px-3 py-2 text-xs font-bold text-[#282c3f] outline-none focus:ring-2 focus:ring-[#ff3f6c]"
                        />
                        <button type="button" onClick={() => updateRows(rows.filter((_, itemIndex) => itemIndex !== index))} className="bg-red-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white">
                            Remove
                        </button>
                    </div>
                ))}
            </div>
            {error && <p className="mt-2 text-[10px] font-bold text-red-500">{error}</p>}
        </div>
    );
}
