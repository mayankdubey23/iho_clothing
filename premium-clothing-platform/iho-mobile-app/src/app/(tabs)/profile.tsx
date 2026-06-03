import { PremiumColors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: PremiumColors.primary }}>

            {/* 👑 Header Area */}
            <View
                style={{
                    paddingHorizontal: 24,
                    paddingVertical: 24,
                    backgroundColor: PremiumColors.dark,
                    borderBottomWidth: 1,
                    borderBottomColor: PremiumColors.secondary,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                <View
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        backgroundColor: PremiumColors.accent,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor: PremiumColors.accent,
                    }}>
                    <Ionicons name="person" size={30} color={PremiumColors.primary} />
                </View>
                <View style={{ marginLeft: 16 }}>
                    <Text
                        style={{
                            fontSize: 20,
                            fontWeight: '900',
                            color: PremiumColors.text,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                        }}>
                        Hey, Guest
                    </Text>
                    <Text
                        style={{
                            fontSize: 12,
                            fontWeight: 'bold',
                            color: PremiumColors.secondary,
                            marginTop: 4,
                        }}>
                        Sign in to access your orders
                    </Text>
                </View>
            </View>

            <ScrollView
                style={{ flex: 1, paddingHorizontal: 16, paddingTop: 24 }}
                showsVerticalScrollIndicator={false}>

                {/* Sign In Banner */}
                <TouchableOpacity
                    style={{
                        backgroundColor: PremiumColors.accent,
                        borderRadius: 16,
                        padding: 20,
                        marginBottom: 32,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        elevation: 8,
                        shadowColor: PremiumColors.accent,
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                    }}>
                    <View>
                        <Text
                            style={{
                                color: PremiumColors.primary,
                                fontWeight: '900',
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                                fontSize: 18,
                                marginBottom: 4,
                            }}>
                            Login / Register
                        </Text>
                        <Text
                            style={{
                                color: PremiumColors.primary,
                                fontSize: 12,
                                fontWeight: 'bold',
                                opacity: 0.8,
                            }}>
                            Manage orders & franchise info
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={PremiumColors.primary} />
                </TouchableOpacity>

                {/* 📦 Orders & Account */}
                <Text
                    style={{
                        color: PremiumColors.text,
                        fontWeight: '900',
                        fontSize: 12,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        marginBottom: 12,
                        paddingHorizontal: 8,
                    }}>
                    My Account
                </Text>
                <View
                    style={{
                        backgroundColor: PremiumColors.dark,
                        borderRadius: 16,
                        paddingHorizontal: 8,
                        elevation: 4,
                        borderWidth: 1,
                        borderColor: PremiumColors.secondary,
                        marginBottom: 32,
                    }}>
                    {[
                        { icon: 'cube-outline', label: 'My Orders', desc: 'Track your packages' },
                        { icon: 'location-outline', label: 'Saved Addresses', desc: 'Manage delivery locations' },
                        { icon: 'card-outline', label: 'Payment Methods', desc: 'Saved cards & wallets' }
                    ].map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 16,
                                paddingHorizontal: 16,
                                borderBottomWidth: index < 2 ? 1 : 0,
                                borderBottomColor: PremiumColors.secondary,
                            }}>
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: PremiumColors.primary,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderWidth: 1,
                                    borderColor: PremiumColors.accent,
                                }}>
                                <Ionicons name={item.icon as any} size={20} color={PremiumColors.accent} />
                            </View>
                            <View style={{ marginLeft: 16, flex: 1 }}>
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: '900',
                                        color: PremiumColors.text,
                                    }}>
                                    {item.label}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 11,
                                        color: PremiumColors.secondary,
                                        fontWeight: 'bold',
                                        marginTop: 2,
                                    }}>
                                    {item.desc}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={PremiumColors.secondary} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 💼 Franchise & VIP */}
                <Text
                    style={{
                        color: PremiumColors.text,
                        fontWeight: '900',
                        fontSize: 12,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        marginBottom: 12,
                        paddingHorizontal: 8,
                    }}>
                    IHO Community
                </Text>
                <View
                    style={{
                        backgroundColor: PremiumColors.dark,
                        borderRadius: 16,
                        paddingHorizontal: 8,
                        elevation: 4,
                        borderWidth: 1,
                        borderColor: PremiumColors.accent,
                        marginBottom: 40,
                    }}>
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 16,
                            paddingHorizontal: 16,
                        }}>
                        <View
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: PremiumColors.accent,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: PremiumColors.accent,
                            }}>
                            <Ionicons name="star" size={20} color={PremiumColors.primary} />
                        </View>
                        <View style={{ marginLeft: 16, flex: 1 }}>
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: '900',
                                    color: PremiumColors.text,
                                }}>
                                Franchise Portal
                            </Text>
                            <Text
                                style={{
                                    fontSize: 11,
                                    color: PremiumColors.secondary,
                                    fontWeight: 'bold',
                                    marginTop: 2,
                                }}>
                                Access B2B dashboard
                            </Text>
                        </View>
                        <Ionicons name="lock-closed" size={16} color={PremiumColors.secondary} />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
