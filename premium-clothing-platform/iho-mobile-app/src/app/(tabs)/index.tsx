import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    View,
} from 'react-native';

import { api, SITE_BASE_URL } from '@/lib/api';
import { getRecentProducts, type RecentProduct } from '@/lib/recent-products';

const { height, width } = Dimensions.get('window');
const HERO_HEIGHT = height - 84;

type HeroSlide = {
    id: number | string;
    tag?: string;
    title?: string;
    btnText?: string;
    btn_text?: string;
    image?: string;
    image_url?: string;
};

type Product = RecentProduct & {
    category?: { name?: string; slug?: string } | string;
    category_name?: string;
    subcategory_slug?: string;
    gender?: string;
    is_best_seller?: boolean;
    sales_count?: number | string;
    weekly_sales?: number | string;
};

type Campaign = {
    id: string;
    tag: string;
    title: string;
    action: string;
    image: string;
};

type QuickAction = {
    label: string;
    eyebrow: string;
    route:
        | { pathname: '/shop'; params?: Record<string, string> }
        | { pathname: '/men'; params?: Record<string, string> }
        | { pathname: '/offers'; params?: Record<string, string> };
};

const quickActions: QuickAction[] = [
    { label: 'New', eyebrow: 'Latest', route: { pathname: '/shop', params: { sort: 'latest' } } },
    { label: 'Men', eyebrow: 'Edit', route: { pathname: '/men' } },
    { label: 'Women', eyebrow: 'Edit', route: { pathname: '/shop', params: { gender: 'women' } } },
    { label: 'Gym', eyebrow: 'Power', route: { pathname: '/shop', params: { category: 'gym-wear' } } },
    { label: 'Running', eyebrow: 'Pace', route: { pathname: '/shop', params: { category: 'running-wear' } } },
    { label: 'Sale', eyebrow: 'Live', route: { pathname: '/offers' } },
];

const activities = ['training', 'running', 'yoga', 'lifestyle', 'cricket', 'football'];

function toAssetUrl(path?: string | null) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/storage/')) return `${SITE_BASE_URL}${path}`;
    if (path.startsWith('storage/')) return `${SITE_BASE_URL}/${path}`;
    return `${SITE_BASE_URL}/storage/${path.replace(/^\/+/, '')}`;
}

function productImage(product: RecentProduct) {
    return toAssetUrl(product.images?.[0]?.url || product.images?.[0]?.image_path || product.image_path);
}

function money(value?: number | string) {
    const amount = Number(value || 0);
    return amount ? `Rs ${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '';
}

function productSearchText(product: Product) {
    const category = typeof product.category === 'object' ? product.category?.name : product.category;
    return [
        product.name,
        category,
        product.category_name,
        product.subcategory_slug,
        product.gender,
    ].filter(Boolean).join(' ').toLowerCase();
}

function salesScore(product: Product) {
    return Number(product.weekly_sales || product.sales_count || 0);
}

export default function HomeScreen() {
    const router = useRouter();
    const scrollY = useRef(new Animated.Value(0)).current;
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchStorefrontData() {
            try {
                const [heroRes, productRes] = await Promise.all([
                    api.get('/hero-slides'),
                    api.get('/products', { params: { per_page: 60 } }),
                ]);

                if (!mounted) return;

                if (heroRes.data?.success) {
                    setSlides(heroRes.data.data || []);
                }

                setProducts(productRes.data?.data?.data || productRes.data?.data || []);
            } catch (error) {
                console.log('Home API Fetch Error:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchStorefrontData();

        return () => {
            mounted = false;
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            setRecentProducts(getRecentProducts());
        }, []),
    );

    const campaigns = useMemo<Campaign[]>(() => {
        const apiCampaigns = slides
            .map((slide) => ({
                id: String(slide.id),
                tag: slide.tag || '',
                title: slide.title || '',
                action: slide.btnText || slide.btn_text || 'Shop Collection',
                image: slide.image || slide.image_url || '',
            }))
            .filter((slide) => slide.image && slide.title);

        if (apiCampaigns.length) return apiCampaigns.slice(0, 4);

        return products
            .filter((product) => productImage(product))
            .slice(0, 2)
            .map((product) => ({
                id: String(product.id),
                tag: typeof product.category === 'object' ? product.category?.name || '' : product.category_name || '',
                title: product.name,
                action: 'Shop Collection',
                image: productImage(product),
            }));
    }, [products, slides]);

    const newDrops = useMemo(() => (
        products.filter((product) => productImage(product)).slice(0, 12)
    ), [products]);

    const activityCards = useMemo(() => (
        activities
            .map((activity) => {
                const product = products.find((item) => (
                    productImage(item) && productSearchText(item).includes(activity)
                ));

                return product ? { activity, product } : null;
            })
            .filter((item): item is { activity: string; product: Product } => Boolean(item))
    ), [products]);

    const trendingProducts = useMemo(() => (
        products
            .filter((product) => productImage(product) && (salesScore(product) > 0 || product.is_best_seller))
            .sort((a, b) => salesScore(b) - salesScore(a))
            .slice(0, 6)
    ), [products]);

    const openProduct = (product: RecentProduct) => {
        router.push({
            pathname: '/product/[id]',
            params: { id: String(product.slug || product.id) },
        });
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text className="mt-4 text-xs font-black uppercase tracking-[0.28em] text-white/60">
                    Syncing IHO Studio
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <View className="absolute left-0 top-14 z-50 w-full flex-row items-center justify-between px-6">
                <Text className="text-2xl font-black italic tracking-widest text-white">IHO STUDIO</Text>
                <Pressable
                    onPress={() => router.push('/explore')}
                    className="h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/15"
                >
                    <Ionicons name="search" size={20} color="white" />
                </Pressable>
            </View>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true },
                )}
                className="bg-black"
            >
                {campaigns.length ? (
                    <View style={{ height: campaigns.length * HERO_HEIGHT }}>
                        {campaigns.map((campaign, index) => (
                            <CampaignPanel
                                key={campaign.id}
                                campaign={campaign}
                                index={index}
                                scrollY={scrollY}
                                onPress={() => router.push('/shop')}
                            />
                        ))}
                    </View>
                ) : null}

                <View className="bg-[#080D16] px-5 pb-16 pt-8">
                    <QuickActions />

                    {recentProducts.length ? (
                        <ContinueShopping products={recentProducts} onProductPress={openProduct} />
                    ) : null}

                    {newDrops.length ? (
                        <NewDrops products={newDrops} onProductPress={openProduct} />
                    ) : null}

                    {activityCards.length ? (
                        <ShopByActivity
                            cards={activityCards}
                            onActivityPress={(activity) => router.push({
                                pathname: '/shop',
                                params: { category: activity },
                            })}
                        />
                    ) : null}

                    {trendingProducts.length ? (
                        <TrendingNow products={trendingProducts} onProductPress={openProduct} />
                    ) : null}
                </View>
            </Animated.ScrollView>
        </View>
    );
}

function CampaignPanel({
    campaign,
    index,
    scrollY,
    onPress,
}: {
    campaign: Campaign;
    index: number;
    scrollY: Animated.Value;
    onPress: () => void;
}) {
    const inputRange = [
        (index - 1) * HERO_HEIGHT,
        index * HERO_HEIGHT,
        (index + 1) * HERO_HEIGHT,
    ];
    const scale = scrollY.interpolate({
        inputRange,
        outputRange: [1.08, 1, 0.92],
        extrapolate: 'clamp',
    });
    const imageScale = scrollY.interpolate({
        inputRange,
        outputRange: [1.22, 1.08, 1.18],
        extrapolate: 'clamp',
    });
    const translateY = scrollY.interpolate({
        inputRange,
        outputRange: [36, 0, -44],
        extrapolate: 'clamp',
    });
    const opacity = scrollY.interpolate({
        inputRange,
        outputRange: [0.35, 1, 0.15],
        extrapolate: 'clamp',
    });

    return (
        <Animated.View
            style={{
                height: HERO_HEIGHT,
                width,
                opacity,
                transform: [{ scale }, { translateY }],
            }}
            className="overflow-hidden bg-black"
        >
            <Animated.Image
                source={{ uri: campaign.image }}
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    resizeMode: 'cover',
                    transform: [{ scale: imageScale }],
                }}
            />
            <View className="absolute inset-0 bg-black/35" />
            <View className="absolute inset-x-0 bottom-0 h-72 bg-black/70" />

            <View className="flex-1 justify-end px-7 pb-24">
                {campaign.tag ? (
                    <Text className="mb-4 text-[11px] font-black uppercase tracking-[0.32em] text-white/75">
                        {campaign.tag}
                    </Text>
                ) : null}
                <Text className="mb-8 text-6xl font-black uppercase leading-[58px] tracking-normal text-white">
                    {campaign.title}
                </Text>
                <Pressable onPress={onPress} className="h-14 flex-row items-center self-start rounded-full border border-white/25 bg-white/10 px-7">
                    <Text className="mr-3 text-xs font-black uppercase tracking-widest text-white">
                        {campaign.action}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="white" />
                </Pressable>
            </View>
        </Animated.View>
    );
}

function QuickActions() {
    const router = useRouter();

    return (
        <View className="mb-12">
            <View className="flex-row flex-wrap justify-between">
                {quickActions.map((action) => (
                    <QuickActionCard
                        key={action.label}
                        label={action.label}
                        eyebrow={action.eyebrow}
                        onPress={() => router.push(action.route)}
                    />
                ))}
            </View>
        </View>
    );
}

function QuickActionCard({ label, eyebrow, onPress }: { label: string; eyebrow: string; onPress: () => void }) {
    const scale = useRef(new Animated.Value(1)).current;

    return (
        <Pressable
            onPress={onPress}
            onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
            className="mb-3 w-[48.5%]"
        >
            <Animated.View
                style={{ transform: [{ scale }] }}
                className="h-28 justify-between rounded-2xl border border-white/10 bg-white/10 p-5"
            >
                <Text className="text-[10px] font-black uppercase tracking-[0.28em] text-white/45">
                    {eyebrow}
                </Text>
                <Text className="text-3xl font-black uppercase tracking-normal text-white">
                    {label}
                </Text>
            </Animated.View>
        </Pressable>
    );
}

function ContinueShopping({
    products,
    onProductPress,
}: {
    products: RecentProduct[];
    onProductPress: (product: RecentProduct) => void;
}) {
    return (
        <View className="mb-12">
            <Text className="mb-5 text-xl font-black uppercase tracking-widest text-white">
                Continue Shopping
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {products.map((product) => (
                    <SmallProductCard
                        key={product.id}
                        product={product}
                        onPress={() => onProductPress(product)}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

function NewDrops({
    products,
    onProductPress,
}: {
    products: Product[];
    onProductPress: (product: Product) => void;
}) {
    const left = products.filter((_, index) => index % 2 === 0);
    const right = products.filter((_, index) => index % 2 === 1);

    return (
        <View className="mb-14">
            <Text className="mb-6 text-3xl font-black uppercase tracking-widest text-white">
                New Drops
            </Text>
            <View className="flex-row justify-between">
                <View className="w-[48%]">
                    {left.map((product, index) => (
                        <MasonryProductCard
                            key={product.id}
                            product={product}
                            tall={index % 2 === 0}
                            onPress={() => onProductPress(product)}
                        />
                    ))}
                </View>
                <View className="mt-10 w-[48%]">
                    {right.map((product, index) => (
                        <MasonryProductCard
                            key={product.id}
                            product={product}
                            tall={index % 2 === 1}
                            onPress={() => onProductPress(product)}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
}

function ShopByActivity({
    cards,
    onActivityPress,
}: {
    cards: Array<{ activity: string; product: Product }>;
    onActivityPress: (activity: string) => void;
}) {
    return (
        <View className="mb-14">
            <Text className="mb-6 text-xl font-black uppercase tracking-widest text-white">
                Shop By Activity
            </Text>
            {cards.map(({ activity, product }) => (
                <Pressable
                    key={activity}
                    onPress={() => onActivityPress(activity)}
                    className="mb-4 h-44 overflow-hidden rounded-2xl bg-slate-900"
                >
                    <Image source={{ uri: productImage(product) }} className="absolute inset-0 h-full w-full" resizeMode="cover" />
                    <View className="absolute inset-0 bg-black/45" />
                    <View className="flex-1 justify-end p-5">
                        <Text className="text-4xl font-black uppercase tracking-normal text-white">
                            {activity}
                        </Text>
                    </View>
                </Pressable>
            ))}
        </View>
    );
}

function TrendingNow({
    products,
    onProductPress,
}: {
    products: Product[];
    onProductPress: (product: Product) => void;
}) {
    return (
        <View>
            <Text className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50">
                Trending
            </Text>
            <Text className="mb-5 mt-1 text-2xl font-black uppercase tracking-normal text-white">
                Most Bought This Week
            </Text>
            <View className="flex-row flex-wrap justify-between">
                {products.map((product) => (
                    <StandardProductCard
                        key={product.id}
                        product={product}
                        onPress={() => onProductPress(product)}
                    />
                ))}
            </View>
        </View>
    );
}

function SmallProductCard({ product, onPress }: { product: RecentProduct; onPress: () => void }) {
    const image = productImage(product);

    if (!image) return null;

    return (
        <Pressable onPress={onPress} className="mr-3 w-32 overflow-hidden rounded-2xl bg-[#111827]">
            <Image source={{ uri: image }} className="h-40 w-full" resizeMode="cover" />
            <View className="p-3">
                <Text className="text-xs font-black text-white" numberOfLines={1}>
                    {product.name}
                </Text>
                {money(product.price || product.base_price) ? (
                    <Text className="mt-1 text-[10px] font-black uppercase tracking-widest text-white/45">
                        {money(product.price || product.base_price)}
                    </Text>
                ) : null}
            </View>
        </Pressable>
    );
}

function MasonryProductCard({
    product,
    tall,
    onPress,
}: {
    product: Product;
    tall: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable onPress={onPress} className="mb-4 overflow-hidden rounded-2xl bg-[#111827]">
            <Image
                source={{ uri: productImage(product) }}
                className={tall ? 'h-72 w-full' : 'h-56 w-full'}
                resizeMode="cover"
            />
            <View className="p-4">
                <Text className="text-sm font-black uppercase text-white" numberOfLines={2}>
                    {product.name}
                </Text>
                {money(product.price || product.base_price) ? (
                    <Text className="mt-2 text-xs font-black uppercase tracking-widest text-white/55">
                        {money(product.price || product.base_price)}
                    </Text>
                ) : null}
            </View>
        </Pressable>
    );
}

function StandardProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            className="mb-4 w-[48%] overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]"
        >
            <Image source={{ uri: productImage(product) }} className="aspect-[4/5] w-full" resizeMode="cover" />
            <View className="p-3">
                <Text className="text-sm font-black text-white" numberOfLines={1}>
                    {product.name}
                </Text>
                {money(product.price || product.base_price) ? (
                    <Text className="mt-1 text-[11px] font-black uppercase tracking-widest text-sky-300">
                        {money(product.price || product.base_price)}
                    </Text>
                ) : null}
            </View>
        </Pressable>
    );
}
