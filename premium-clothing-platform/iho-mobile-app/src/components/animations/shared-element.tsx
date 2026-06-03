import { PremiumColors } from '@/constants/theme';
import React from 'react';
import { Image, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';

interface SharedElementProps {
    id: string;
    children: React.ReactNode;
    style?: ViewStyle;
    isActive?: boolean;
    onLayout?: (width: number, height: number, x: number, y: number) => void;
}

export const SharedElement: React.FC<SharedElementProps> = ({
    id,
    children,
    style,
    isActive = false,
    onLayout,
}) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                animatedStyle,
                style,
                {
                    overflow: 'hidden',
                },
            ]}
            onLayout={(event) => {
                const { width, height, x, y } = event.nativeEvent.layout;
                onLayout?.(width, height, x, y);
            }}
        >
            {children}
        </Animated.View>
    );
};

interface ProductImageTransitionProps {
    source: string;
    targetId: string;
    style?: ViewStyle;
}

export const ProductImageTransition: React.FC<ProductImageTransitionProps> = ({
    source,
    targetId,
    style,
}) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: scale.value,
            },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.imageContainer,
                animatedStyle,
                style,
            ]}
        >
            <Image
                source={{ uri: source }}
                style={styles.image}
                resizeMode="cover"
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    imageContainer: {
        overflow: 'hidden',
        borderRadius: 12,
        backgroundColor: PremiumColors.dark,
    },
    image: {
        width: '100%',
        height: '100%',
    },
});
