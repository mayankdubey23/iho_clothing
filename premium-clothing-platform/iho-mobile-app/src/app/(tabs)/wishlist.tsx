import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WishlistScreen() {
    return (
        <SafeAreaView className="flex-1 bg-[#F8FAFC]">
            <View className="px-6 py-4 border-b border-slate-100 bg-white">
                <Text className="text-2xl font-black text-[#1E293B] tracking-wide">Saved Items</Text>
                <Text className="text-slate-500 font-bold text-xs mt-1">2 items in your wishlist</Text>
            </View>

            <ScrollView className="flex-1 px-4 pt-4">
                {[1, 2].map((item) => (
                    <View key={item} className="flex-row bg-white p-3 rounded-2xl shadow-sm border border-slate-100 mb-4 items-center">
                        {/* Product Image Placeholder */}
                        <View className="size-24 bg-slate-100 rounded-xl items-center justify-center">
                            <Ionicons name="shirt-outline" size={30} color="#CBD5E1" />
                        </View>

                        {/* Details */}
                        <View className="flex-1 ml-4 justify-center">
                            <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Trackpants</Text>
                            <Text className="text-sm font-black text-[#1E293B] mb-2" numberOfLines={2}>IHO Essential Black Cargo Trackpants</Text>
                            <Text className="text-[#0B5CAD] font-bold text-lg">₹1,299</Text>
                        </View>

                        {/* Remove Button */}
                        <TouchableOpacity className="p-2 bg-red-50 rounded-full">
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}