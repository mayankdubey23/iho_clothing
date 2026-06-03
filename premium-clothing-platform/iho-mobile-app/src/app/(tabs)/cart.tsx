import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartScreen() {
    return (
        <SafeAreaView className="flex-1 bg-[#F8FAFC]">
            <View className="px-6 py-4 border-b border-slate-100 bg-white">
                <Text className="text-2xl font-black text-[#1E293B] tracking-wide">Your Cart</Text>
            </View>

            <ScrollView className="flex-1 px-4 pt-4">
                {/* Cart Item */}
                <View className="flex-row bg-white p-3 rounded-2xl shadow-sm border border-slate-100 mb-4 items-center">
                    <View className="size-20 bg-slate-100 rounded-xl items-center justify-center">
                        <Ionicons name="shirt" size={24} color="#CBD5E1" />
                    </View>
                    <View className="flex-1 ml-4">
                        <Text className="text-sm font-black text-[#1E293B] mb-1">Premium White Tee</Text>
                        <Text className="text-xs text-slate-500 font-bold mb-2">Size: L | Qty: 1</Text>
                        <Text className="text-[#0B5CAD] font-bold">₹999</Text>
                    </View>
                    {/* Qty Controls */}
                    <View className="items-center bg-slate-50 rounded-xl border border-slate-200">
                        <TouchableOpacity className="p-2"><Ionicons name="add" size={16} color="#1E293B" /></TouchableOpacity>
                        <Text className="font-bold text-[#1E293B]">1</Text>
                        <TouchableOpacity className="p-2"><Ionicons name="remove" size={16} color="#1E293B" /></TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Checkout Bottom Sheet */}
            <View className="bg-white p-6 rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-slate-100">
                <View className="flex-row justify-between mb-2">
                    <Text className="text-slate-500 font-bold">Subtotal</Text>
                    <Text className="text-[#1E293B] font-bold">₹999</Text>
                </View>
                <View className="flex-row justify-between mb-4 pb-4 border-b border-slate-100">
                    <Text className="text-slate-500 font-bold">Shipping</Text>
                    <Text className="text-green-500 font-bold">FREE</Text>
                </View>
                <View className="flex-row justify-between mb-6 items-center">
                    <Text className="text-lg font-black text-[#1E293B] uppercase tracking-wider">Total</Text>
                    <Text className="text-2xl font-black text-[#0B5CAD]">₹999</Text>
                </View>

                <TouchableOpacity className="w-full bg-[#1E293B] py-4 rounded-xl items-center shadow-md">
                    <Text className="text-white font-black uppercase tracking-widest text-sm">Proceed to Checkout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}