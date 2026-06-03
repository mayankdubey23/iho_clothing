import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    Bell,
    CreditCard,
    Heart,
    HelpCircle,
    Lock,
    LogOut,
    MapPin,
    Package,
    PackageOpen,
    RefreshCcw,
    ShieldCheck,
    ShoppingBag,
    Ticket,
    Trash2,
    User,
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { getCartItems } from '@/lib/cart';
import { getWishlistItems, removeWishlistItem } from '@/lib/wishlist';
import {
    AddressBook,
    Coupons,
    DeleteAccount,
    HelpSupport,
    Notifications,
    PaymentMethods,
    PrivacySettings,
    ProfileSettings,
    ReturnsRefunds,
    SecuritySettings,
} from '@/Components/Account/SettingsTabs';

const menuGroups = [
    {
        title: 'Dashboard',
        items: [
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'orders', label: 'My Orders', icon: Package },
            { id: 'cart', label: 'Current Bag', icon: ShoppingBag },
            { id: 'wishlist', label: 'Wishlist', icon: Heart },
            { id: 'addresses', label: 'Address Book', icon: MapPin },
            { id: 'coupons', label: 'Coupons', icon: Ticket },
            { id: 'returns', label: 'Returns', icon: RefreshCcw },
        ],
    },
    {
        title: 'Settings',
        items: [
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: ShieldCheck },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'privacy', label: 'Privacy', icon: Lock },
            { id: 'support', label: 'Support', icon: HelpCircle },
            { id: 'delete', label: 'Delete Account', icon: Trash2, danger: true },
        ],
    },
];

const statusTone = {
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    processing: 'border-blue-200 bg-blue-50 text-blue-700',
    shipped: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    delivered: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    cancelled: 'border-red-200 bg-red-50 text-red-700',
};

export default function Account({ orders = [], applications = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [activeTab, setActiveTab] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('tab') || 'overview';
    });
    const [cartItems, setCartItems] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [activityFeed, setActivityFeed] = useState([]);

    const orderList = Array.isArray(orders) ? orders : [];

    useEffect(() => {
        window.history.replaceState(null, '', `/account?tab=${activeTab}`);
    }, [activeTab]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const placed = params.get('placed');
        const paid = params.get('paid');

        if (placed || paid) {
            setActiveTab('orders');
            setActivityFeed([{
                id: `order-${Date.now()}`,
                label: paid ? 'Payment completed' : 'Order placed',
                detail: 'Your order archive has been refreshed.',
                time: 'Just now',
            }]);
        }
    }, []);

    useEffect(() => {
        const syncCart = () => {
            const nextItems = getCartItems();
            setCartItems(nextItems);
            setActivityFeed((items) => [
                {
                    id: `cart-${Date.now()}`,
                    label: 'Bag updated',
                    detail: `${nextItems.length} item${nextItems.length === 1 ? '' : 's'} currently selected.`,
                    time: 'Just now',
                },
                ...items,
            ].slice(0, 6));
        };

        const syncWishlist = () => {
            const nextItems = getWishlistItems();
            setWishlistItems(nextItems);
            setActivityFeed((items) => [
                {
                    id: `wishlist-${Date.now()}`,
                    label: 'Wishlist updated',
                    detail: `${nextItems.length} saved item${nextItems.length === 1 ? '' : 's'}.`,
                    time: 'Just now',
                },
                ...items,
            ].slice(0, 6));
        };

        setCartItems(getCartItems());
        setWishlistItems(getWishlistItems());
        window.addEventListener('cart-updated', syncCart);
        window.addEventListener('wishlist-updated', syncWishlist);
        window.addEventListener('storage', syncCart);
        window.addEventListener('storage', syncWishlist);

        return () => {
            window.removeEventListener('cart-updated', syncCart);
            window.removeEventListener('wishlist-updated', syncWishlist);
            window.removeEventListener('storage', syncCart);
            window.removeEventListener('storage', syncWishlist);
        };
    }, []);

    useEffect(() => {
        if (activeTab !== 'orders') return undefined;

        const timer = window.setInterval(() => {
            router.reload({ only: ['orders'], preserveState: true, preserveScroll: true });
        }, 30000);

        return () => window.clearInterval(timer);
    }, [activeTab]);

    const stats = useMemo(() => {
        const activeOrders = orderList.filter((order) => !['delivered', 'cancelled', 'returned', 'refunded'].includes(String(order.status || '').toLowerCase()));
        const totalSpend = orderList.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
        const cartTotal = cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);

        return {
            activeOrders: activeOrders.length,
            totalOrders: orderList.length,
            totalSpend,
            cartCount: cartItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0),
            cartTotal,
            wishlistCount: wishlistItems.length,
        };
    }, [cartItems, orderList, wishlistItems]);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const removeSavedItem = (id) => {
        setWishlistItems(removeWishlistItem(id));
    };

    if (!user) return null;

    return (
        <AppLayout>
            <Head title="My Account | IHO Clothing" />

            <div className="bg-[#f5f5f6] min-h-screen">
                <section className="border-b border-slate-200 bg-white px-6 py-10 md:py-14">
                    <div className="mx-auto flex max-w-[1400px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#ff3f6c]">IHO Account</p>
                            <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-[#282c3f] md:text-6xl">
                                {user.name}
                            </h1>
                            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-[#64748B]">{user.email}</p>
                        </div>
                        <div className="grid grid-cols-3 border border-slate-200 bg-white text-center">
                            <StatTile label="Orders" value={stats.totalOrders} />
                            <StatTile label="Bag" value={stats.cartCount} />
                            <StatTile label="Saved" value={stats.wishlistCount} />
                        </div>
                    </div>
                </section>

                <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-8 lg:grid-cols-[280px_1fr]">
                    <aside className="lg:sticky lg:top-28 lg:self-start">
                        <div className="border border-slate-200 bg-white">
                            {menuGroups.map((group) => (
                                <div key={group.title} className="border-b border-slate-100 p-4 last:border-b-0">
                                    <p className="mb-3 px-2 text-[9px] font-black uppercase tracking-[0.3em] text-[#ff3f6c]">{group.title}</p>
                                    <nav className="space-y-1">
                                        {group.items.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = activeTab === item.id;

                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => setActiveTab(item.id)}
                                                    className={`flex w-full items-center justify-between px-3 py-3 text-left transition-colors ${
                                                        isActive
                                                            ? 'bg-[#282c3f] text-white'
                                                            : item.danger
                                                                ? 'text-red-500 hover:bg-red-50'
                                                                : 'text-[#64748B] hover:bg-slate-50 hover:text-[#282c3f]'
                                                    }`}
                                                >
                                                    <span className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest">
                                                        <Icon size={16} />
                                                        {item.label}
                                                    </span>
                                                    {isActive && <span className="h-1.5 w-1.5 bg-[#ff3f6c]" />}
                                                </button>
                                            );
                                        })}
                                    </nav>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 border-t border-slate-100 px-7 py-5 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    </aside>

                    <main>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.22 }}
                                className="border border-slate-200 bg-white p-6 md:p-8"
                            >
                                {activeTab === 'overview' && (
                                    <Overview
                                        activityFeed={activityFeed}
                                        applications={applications}
                                        cartItems={cartItems}
                                        orders={orderList}
                                        setActiveTab={setActiveTab}
                                        stats={stats}
                                        wishlistItems={wishlistItems}
                                    />
                                )}
                                {activeTab === 'orders' && <OrdersPanel orders={orderList} />}
                                {activeTab === 'cart' && <CartPanel items={cartItems} total={stats.cartTotal} />}
                                {activeTab === 'wishlist' && <WishlistPanel items={wishlistItems} onRemove={removeSavedItem} />}
                                {activeTab === 'addresses' && <AddressBook />}
                                {activeTab === 'profile' && <ProfileSettings user={user} />}
                                {activeTab === 'security' && <SecuritySettings />}
                                {activeTab === 'notifications' && <Notifications />}
                                {activeTab === 'payments' && <PaymentMethods />}
                                {activeTab === 'privacy' && <PrivacySettings />}
                                {activeTab === 'support' && <HelpSupport />}
                                {activeTab === 'coupons' && <Coupons />}
                                {activeTab === 'returns' && <ReturnsRefunds />}
                                {activeTab === 'delete' && <DeleteAccount />}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </AppLayout>
    );
}

function Overview({ activityFeed, applications, cartItems, orders, setActiveTab, stats, wishlistItems }) {
    const latestOrder = orders[0];

    return (
        <div className="space-y-8">
            <SectionHeader eyebrow="Live Dashboard" title="Your Studio Snapshot" />

            <div className="grid gap-4 md:grid-cols-4">
                <MetricCard label="Active Orders" value={stats.activeOrders} icon={Package} />
                <MetricCard label="Lifetime Orders" value={stats.totalOrders} icon={PackageOpen} />
                <MetricCard label="Current Bag" value={stats.cartCount} icon={ShoppingBag} />
                <MetricCard label="Saved Gear" value={stats.wishlistCount} icon={Heart} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                <div className="border border-slate-200 bg-white p-6">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#282c3f]">Latest Order</h3>
                        <button type="button" onClick={() => setActiveTab('orders')} className="text-[10px] font-black uppercase tracking-widest text-[#ff3f6c] hover:text-[#282c3f]">
                            View Orders
                        </button>
                    </div>

                    {latestOrder ? (
                        <OrderCard order={latestOrder} compact />
                    ) : (
                        <EmptyState icon={PackageOpen} title="No orders yet" message="Your order archive will appear here after checkout." action="Start Shopping" href="/shop" />
                    )}
                </div>

                <div className="border border-slate-200 bg-slate-50 p-6">
                    <h3 className="mb-5 text-sm font-black uppercase tracking-widest text-[#282c3f]">Real Time Activity</h3>
                    {activityFeed.length > 0 ? (
                        <div className="space-y-3">
                            {activityFeed.map((item) => (
                                <div key={item.id} className="border border-slate-200 bg-white p-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#282c3f]">{item.label}</p>
                                    <p className="mt-1 text-xs font-semibold text-[#64748B]">{item.detail}</p>
                                    <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-[#ff3f6c]">{item.time}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="border border-dashed border-slate-200 bg-white p-8 text-center text-[10px] font-black uppercase tracking-widest text-[#ff3f6c]">
                            Cart, wishlist, and order actions will appear here.
                        </p>
                    )}
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <MiniList title="Bag Now" count={cartItems.length} action="Checkout" href="/checkout" items={cartItems.map((item) => ({
                    id: item.sku_id,
                    name: item.name,
                    meta: `${item.size} / ${item.color} x ${item.quantity}`,
                    price: Number(item.price || 0) * Number(item.quantity || 1),
                }))} />
                <MiniList title="Wishlist" count={wishlistItems.length} action="View Wishlist" href="/wishlist" items={wishlistItems.map((item) => ({
                    id: item.id,
                    name: item.name,
                    meta: item.category?.name || item.category || 'Saved item',
                    price: Number(item.price || item.base_price || 0),
                }))} />
            </div>

            {applications?.length > 0 && (
                <div className="border border-slate-200 bg-white p-6">
                    <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-[#282c3f]">Franchise Applications</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                        {applications.map((application) => (
                            <div key={application.id} className="border border-slate-100 p-4">
                                <p className="text-xs font-black uppercase tracking-widest text-[#282c3f]">{application.franchise_plan?.name || 'Application'}</p>
                                <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-[#ff3f6c]">{application.status || 'Submitted'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function OrdersPanel({ orders }) {
    return (
        <div className="space-y-6">
            <SectionHeader eyebrow="Real Orders" title="Order History" />
            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => <OrderCard key={order.id} order={order} />)}
                </div>
            ) : (
                <EmptyState icon={PackageOpen} title="No orders yet" message="Once you place an order, it will show here automatically." action="Shop Collection" href="/shop" />
            )}
        </div>
    );
}

function OrderCard({ order, compact = false }) {
    const status = String(order.status || 'pending').toLowerCase();
    const items = Array.isArray(order.items) ? order.items : [];

    return (
        <div className="border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff3f6c]">Order #{order.order_number || order.id}</p>
                    <h3 className="mt-2 text-xl font-black uppercase tracking-tight text-[#282c3f]">Rs {Number(order.total_amount || 0).toLocaleString('en-IN')}</h3>
                    <p className="mt-1 text-xs font-bold text-[#64748B]">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <span className={`border px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${statusTone[status] || 'border-slate-200 bg-slate-50 text-[#64748B]'}`}>
                        {order.status || 'pending'}
                    </span>
                    <span className="border border-slate-200 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#64748B]">
                        {order.payment?.method || order.payment_method || 'COD'} / {order.payment?.status || order.payment_status || 'pending'}
                    </span>
                </div>
            </div>

            {!compact && (
                <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                    {items.length > 0 ? items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-[#282c3f]">{item.product?.name || `Product #${item.product_id}`}</p>
                                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#ff3f6c]">
                                    {item.sku?.size || 'Size'} / {item.sku?.color || 'Color'} x {item.quantity}
                                </p>
                            </div>
                            <p className="text-sm font-black text-[#282c3f]">Rs {Number(item.total_price || (Number(item.price || item.unit_price || 0) * Number(item.quantity || 1))).toLocaleString('en-IN')}</p>
                        </div>
                    )) : (
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#ff3f6c]">Items are being prepared.</p>
                    )}
                </div>
            )}
        </div>
    );
}

function CartPanel({ items, total }) {
    return (
        <div className="space-y-6">
            <SectionHeader eyebrow="Live Bag" title="Current Cart" />
            {items.length > 0 ? (
                <>
                    <div className="grid gap-4 md:grid-cols-2">
                        {items.map((item) => (
                            <ProductMiniCard key={item.sku_id} item={item} />
                        ))}
                    </div>
                    <div className="flex flex-col gap-4 border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-black uppercase tracking-widest text-[#282c3f]">Cart Total: Rs {total.toLocaleString('en-IN')}</p>
                        <Link href="/checkout" className="inline-flex items-center justify-center gap-2 bg-black px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#282c3f]">
                            Checkout <ArrowRight size={14} />
                        </Link>
                    </div>
                </>
            ) : (
                <EmptyState icon={ShoppingBag} title="Your bag is empty" message="Products added from the storefront appear here instantly." action="Browse Gear" href="/shop" />
            )}
        </div>
    );
}

function WishlistPanel({ items, onRemove }) {
    return (
        <div className="space-y-6">
            <SectionHeader eyebrow="Saved Gear" title="Wishlist" />
            {items.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((item) => (
                        <div key={item.id} className="border border-slate-200 bg-white">
                            <Link href={item.slug ? `/product/${item.slug}` : '/shop'} className="block aspect-[4/5] bg-slate-50">
                                {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                            </Link>
                            <div className="p-4">
                                <h3 className="line-clamp-2 text-xs font-black uppercase tracking-widest text-[#282c3f]">{item.name}</h3>
                                <p className="mt-2 text-sm font-black text-[#282c3f]">Rs {Number(item.price || item.base_price || 0).toLocaleString('en-IN')}</p>
                                <button type="button" onClick={() => onRemove(item.id)} className="mt-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700">
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState icon={Heart} title="Wishlist is empty" message="Tap the heart icon on products and they will appear here in real time." action="Explore Collection" href="/shop" />
            )}
        </div>
    );
}

function ProductMiniCard({ item }) {
    return (
        <div className="flex gap-4 border border-slate-200 bg-white p-4">
            <div className="h-24 w-20 shrink-0 bg-slate-50">
                {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center">
                <p className="line-clamp-2 text-xs font-black uppercase tracking-widest text-[#282c3f]">{item.name}</p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#ff3f6c]">{item.size} / {item.color} x {item.quantity}</p>
                <p className="mt-2 text-sm font-black text-[#282c3f]">Rs {(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}</p>
            </div>
        </div>
    );
}

function MiniList({ action, count, href, items, title }) {
    return (
        <div className="border border-slate-200 bg-white p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#282c3f]">{title}</h3>
                <Link href={href} className="text-[10px] font-black uppercase tracking-widest text-[#ff3f6c] hover:text-[#282c3f]">{action}</Link>
            </div>
            {count > 0 ? (
                <div className="space-y-3">
                    {items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-[#282c3f]">{item.name}</p>
                                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#ff3f6c]">{item.meta}</p>
                            </div>
                            <p className="text-xs font-black text-[#282c3f]">Rs {item.price.toLocaleString('en-IN')}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="border border-dashed border-slate-200 p-8 text-center text-[10px] font-black uppercase tracking-widest text-[#ff3f6c]">Nothing here yet.</p>
            )}
        </div>
    );
}

function SectionHeader({ eyebrow, title }) {
    return (
        <div className="border-b border-slate-100 pb-5">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#ff3f6c]">{eyebrow}</p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#282c3f] md:text-3xl">{title}</h2>
        </div>
    );
}

function MetricCard({ icon: Icon, label, value }) {
    return (
        <div className="border border-slate-200 bg-white p-5">
            <div className="mb-5 flex items-center justify-between text-[#ff3f6c]">
                <Icon size={18} />
                <span className="h-1.5 w-1.5 bg-[#ff3f6c]" />
            </div>
            <p className="text-3xl font-black tracking-tight text-[#282c3f]">{Number(value || 0).toLocaleString('en-IN')}</p>
            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-[#64748B]">{label}</p>
        </div>
    );
}

function StatTile({ label, value }) {
    return (
        <div className="min-w-24 border-r border-slate-200 px-5 py-4 last:border-r-0">
            <p className="text-2xl font-black text-[#282c3f]">{Number(value || 0).toLocaleString('en-IN')}</p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-[#ff3f6c]">{label}</p>
        </div>
    );
}

function EmptyState({ action, href, icon: Icon, message, title }) {
    return (
        <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
            <Icon size={34} className="mb-5 text-[#ff3f6c]" strokeWidth={1.5} />
            <h3 className="text-lg font-black uppercase tracking-tight text-[#282c3f]">{title}</h3>
            <p className="mt-2 max-w-sm text-sm font-semibold text-[#64748B]">{message}</p>
            {action && href && (
                <Link href={href} className="mt-6 bg-black px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#282c3f]">
                    {action}
                </Link>
            )}
        </div>
    );
}

function formatDate(date) {
    if (!date) return 'Recently';

    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date));
}
