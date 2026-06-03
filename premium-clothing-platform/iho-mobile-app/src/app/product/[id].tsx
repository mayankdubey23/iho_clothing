import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { addRecentProduct } from '@/lib/recent-products';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    const API_BASE_URL = 'http://192.168.29.114:8000/api';

    useEffect(() => {
        fetchProductDetails();
    }, [id]);

    const fetchProductDetails = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/products/${id}`);
            if (response.data.success || response.data.data) {
                const fetchedProduct = response.data.data || response.data;
                setProduct(fetchedProduct);
                addRecentProduct(fetchedProduct);

                // 🚀 Auto-select the first available size from your database
                const availableSizes = fetchedProduct.sizes || ['S', 'M', 'L', 'XL'];
                const defaultSize = typeof availableSizes[0] === 'string' ? availableSizes[0] : availableSizes[0]?.name || 'M';
                setSelectedSize(defaultSize);
            }
        } catch (error) {
            console.log('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#0B5CAD" />
                <Text className="text-slate-500 mt-4 font-bold tracking-widest uppercase text-xs">Loading Fit...</Text>
            </View>
        );
    }

    if (!product) {
        return (
            <View className="flex-1 bg-white justify-center items-center px-6">
                <Ionicons name="alert-circle-outline" size={60} color="#CBD5E1" mb-4 />
                <Text className="text-slate-800 text-xl font-black uppercase mb-4 tracking-widest">Item Not Found</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-[#1E293B] px-8 py-4 rounded-full">
                    <Text className="text-white font-black uppercase tracking-widest text-xs">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // 🚀 Robust Image Loading Logic
    let imageUrl = product.images?.[0]?.url || product.images?.[0]?.image_path;
    if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `http://192.168.29.114:8000/storage/${imageUrl}`;
    }

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* 🔙 Floating Back Button */}
            <TouchableOpacity
                onPress={() => router.back()}
                className="absolute top-14 left-6 z-50 bg-white/90 p-3 rounded-full shadow-sm border border-slate-100"
            >
                <Ionicons name="arrow-back" size={24} color="#1E293B" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">

                {/* 📸 Massive Hero Image */}
                <View style={{ width, height: width * 1.2 }} className="bg-slate-100">
                    {imageUrl ? (
                        <Image
                            source={{ uri: imageUrl }}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <View className="flex-1 items-center justify-center">
                            <Ionicons name="image-outline" size={80} color="#CBD5E1" />
                        </View>
                    )}
                </View>

                {/* 📝 Product Details */}
                <View className="px-6 py-8 bg-white -mt-8 rounded-t-[40px] shadow-lg shadow-slate-200">

                    <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1 pr-4">
                            <Text className="text-[#0B5CAD] font-bold uppercase tracking-widest text-[10px] mb-2">
                                {product.category?.name || 'IHO Exclusive'}
                            </Text>
                            <Text className="text-3xl font-black text-[#1E293B] leading-9">
                                {product.name}
                            </Text>
                        </View>
                        <Text className="text-2xl font-black text-[#1E293B]">
                            ₹{product.price || '999'}
                        </Text>
                    </View>

                    {/* ⭐ REAL REVIEWS FROM LARAVEL */}
                    <View className="flex-row items-center mb-6 mt-1">
                        <View className="flex-row mr-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons
                                    key={star}
                                    name={star <= (product.rating || 4.5) ? "star" : "star-outline"}
                                    size={14}
                                    color="#F59E0B"
                                />
                            ))}
                        </View>
                        <Text className="text-slate-500 font-bold text-xs">
                            {product.rating || '4.5'} ({product.reviews_count || '12'} Reviews)
                        </Text>
                    </View>

                    {/* Divider */}
                    <View className="h-[1px] w-full bg-slate-100 mb-6" />

                    {/* 📏 DYNAMIC SIZES FROM LARAVEL */}
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-[#1E293B] font-black uppercase tracking-wider text-xs">
                            Select Size
                        </Text>
                        <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest underline">
                            Size Guide
                        </Text>
                    </View>

                    <View className="flex-row flex-wrap gap-3 mb-8">
                        {(product.sizes || ['S', 'M', 'L', 'XL']).map((sizeObj: any) => {
                            const sizeName = typeof sizeObj === 'string' ? sizeObj : sizeObj.name;
                            const isSelected = selectedSize === sizeName;

                            return (
                                <TouchableOpacity
                                    key={sizeName}
                                    onPress={() => setSelectedSize(sizeName)}
                                    className={`h-12 min-w-[3rem] px-4 rounded-full items-center justify-center border-2 ${isSelected ? 'bg-[#1E293B] border-[#1E293B]' : 'bg-white border-slate-200'
                                        }`}
                                >
                                    <Text className={`font-black text-sm ${isSelected ? 'text-white' : 'text-[#1E293B]'}`}>
                                        {sizeName}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* 📄 REAL DESCRIPTION FROM LARAVEL */}
                    <Text className="text-[#1E293B] font-black uppercase tracking-wider text-xs mb-3">
                        The Details
                    </Text>
                    <Text className="text-slate-500 font-semibold leading-6 mb-24">
                        {product.description || 'Premium quality fabric tailored for the perfect fit. Built for aesthetics, designed for comfort. Elevate your everyday style with IHO Studio.'}
                    </Text>
                </View>
            </ScrollView>

            {/* 🛒 Sticky Add to Cart Footer */}
            <View className="absolute bottom-0 w-full bg-white px-6 py-4 border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <TouchableOpacity className="bg-[#1E293B] w-full py-4 rounded-2xl flex-row justify-center items-center shadow-md">
                    <Ionicons name="cart-outline" size={20} color="white" />
                    <Text className="text-white font-black uppercase tracking-widest text-sm ml-3">
                        Add to Cart - ₹{product.price || '999'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
