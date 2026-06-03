import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
    return (
        <SafeAreaView className="flex-1 bg-[#F8FAFC]">
            <View className="px-6 py-4">
                <Text className="text-2xl font-black text-[#1E293B] tracking-wide mb-6">Discover</Text>

                {/* Search Bar */}
                <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm mb-8">
                    <Ionicons name="search" size={20} color="#94A3B8" />
                    <TextInput
                        placeholder="Search for t-shirts, trackpants..."
                        placeholderTextColor="#94A3B8"
                        className="flex-1 ml-3 font-semibold text-slate-800"
                    />
                </View>

                {/* Popular Tags */}
                <Text className="text-[#1E293B] font-black text-sm uppercase tracking-wider mb-4">Popular Searches</Text>
                <View className="flex-row flex-wrap gap-2 mb-8">
                    {['Oversized Tees', 'Summer Collection', 'Gym Wear', 'Black Edition'].map((tag, i) => (
                        <TouchableOpacity key={i} className="bg-slate-200/50 px-4 py-2 rounded-full border border-slate-200">
                            <Text className="text-xs font-bold text-slate-600">{tag}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Collection Blocks */}
                <Text className="text-[#1E293B] font-black text-sm uppercase tracking-wider mb-4">Curated For You</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <TouchableOpacity className="h-32 bg-[#1E293B] rounded-2xl p-6 justify-center mb-4 relative overflow-hidden">
                        <View className="absolute -right-4 -bottom-4 bg-white/10 size-32 rounded-full" />
                        <Text className="text-white font-black text-xl tracking-widest uppercase mb-1">Streetwear</Text>
                        <Text className="text-blue-400 font-bold text-xs uppercase tracking-widest">View Collection ➔</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="h-32 bg-slate-200 rounded-2xl p-6 justify-center mb-4">
                        <Text className="text-slate-800 font-black text-xl tracking-widest uppercase mb-1">Active Wear</Text>
                        <Text className="text-[#0B5CAD] font-bold text-xs uppercase tracking-widest">Shop Now ➔</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}