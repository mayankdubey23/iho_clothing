import { PremiumColors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface MagneticButtonProps {
    onPress?: () => void;
    title: string;
    style?: ViewStyle;
    variant?: 'primary' | 'secondary' | 'accent';
    size?: 'sm' | 'md' | 'lg';
    magneticRange?: number;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
    onPress,
    title,
    style,
    variant = 'primary',
    size = 'md',
    magneticRange = 80,
}) => {
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const touchX = useSharedValue(0);
    const touchY = useSharedValue(0);

    const variantStyles = {
        primary: {
            backgroundColor: PremiumColors.accent,
            textColor: PremiumColors.primary,
        },
        secondary: {
            backgroundColor: PremiumColors.dark,
            textColor: PremiumColors.text,
        },
        accent: {
            backgroundColor: PremiumColors.primary,
            textColor: PremiumColors.text,
        },
    };

    const sizeConfig = {
        sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 12 },
        md: { paddingVertical: 12, paddingHorizontal: 24, fontSize: 14 },
        lg: { paddingVertical: 16, paddingHorizontal: 32, fontSize: 16 },
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: offsetX.value },
            { translateY: offsetY.value },
        ],
    }));

    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            const distance = Math.sqrt(
                Math.pow(event.x - touchX.value, 2) + Math.pow(event.y - touchY.value, 2)
            );

            if (distance < magneticRange) {
                offsetX.value = withSpring((event.x - touchX.value) * 0.3);
                offsetY.value = withSpring((event.y - touchY.value) * 0.3);
            }
        })
        .onEnd(() => {
            offsetX.value = withSpring(0);
            offsetY.value = withSpring(0);
        });

    const config = sizeConfig[size];
    const variantColor = variantStyles[variant];

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View
                style={[
                    animatedStyle,
                    {
                        alignSelf: 'center',
                    },
                ]}
            >
                <TouchableOpacity
                    onPress={onPress}
                    onLayout={(event) => {
                        touchX.value = event.nativeEvent.layout.x + event.nativeEvent.layout.width / 2;
                        touchY.value = event.nativeEvent.layout.y + event.nativeEvent.layout.height / 2;
                    }}
                    style={[
                        styles.button,
                        {
                            backgroundColor: variantColor.backgroundColor,
                            paddingVertical: config.paddingVertical,
                            paddingHorizontal: config.paddingHorizontal,
                            borderRadius: 12,
                        },
                        style,
                    ]}
                >
                    <Text
                        style={{
                            color: variantColor.textColor,
                            fontSize: config.fontSize,
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                        }}
                    >
                        {title}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: PremiumColors.accent,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
});
