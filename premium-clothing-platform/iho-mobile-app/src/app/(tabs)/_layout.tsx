import { PremiumColors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: PremiumColors.accent, // #F15A3D Warm Orange
                tabBarInactiveTintColor: PremiumColors.secondary, // #A0AEC0 Soft Grey
                tabBarStyle: {
                    backgroundColor: PremiumColors.primary, // #071327 Dark Navy
                    borderTopWidth: 1,
                    borderTopColor: PremiumColors.dark, // Slightly lighter navy
                    height: Platform.OS === 'ios' ? 85 : 65,
                    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
                    paddingTop: 10,
                    elevation: 15,
                    shadowColor: PremiumColors.accent,
                    shadowOpacity: 0.08,
                    shadowRadius: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginTop: 4,
                },
            }}>

            {/* 🏠 Home - Storefront */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />

            {/* 🔎 Discover - Explore */}
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Discover',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="search" size={size} color={color} />
                    ),
                }}
            />

            {/* 🛍 Shop - Cart */}
            <Tabs.Screen
                name="cart"
                options={{
                    title: 'Shop',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="bag" size={size} color={color} />
                    ),
                }}
            />

            {/* ❤️ Wishlist */}
            <Tabs.Screen
                name="wishlist"
                options={{
                    title: 'Wishlist',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="heart" size={size} color={color} />
                    ),
                }}
            />

            {/* 👤 Profile */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}