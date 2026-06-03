import { PremiumColors } from '@/constants/theme';
import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

interface SkeletonLoaderProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
    shimmer?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    width = '100%',
    height = 20,
    borderRadius = 8,
    style,
    shimmer = true,
}) => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        if (shimmer) {
            opacity.value = withRepeat(
                withTiming(1, {
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            );
        }
    }, [shimmer, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: PremiumColors.dark,
                },
                animatedStyle,
                style,
            ]}
        />
    );
};

interface SkeletonPlaceholderProps {
    rows?: number;
    imageHeight?: number;
    gap?: number;
    style?: ViewStyle;
}

export const SkeletonPlaceholder: React.FC<SkeletonPlaceholderProps> = ({
    rows = 3,
    imageHeight = 200,
    gap = 12,
    style,
}) => {
    return (
        <View style={[styles.placeholder, style]}>
            {/* Image Skeleton */}
            <SkeletonLoader
                width="100%"
                height={imageHeight}
                borderRadius={12}
                style={{ marginBottom: gap }}
            />

            {/* Text Skeletons */}
            {Array.from({ length: rows }).map((_, index) => (
                <View key={index} style={{ marginBottom: gap }}>
                    <SkeletonLoader
                        width={index === rows - 1 ? '70%' : '100%'}
                        height={12}
                        borderRadius={6}
                        style={{ marginBottom: gap / 2 }}
                    />
                    {index === 0 && (
                        <SkeletonLoader
                            width="85%"
                            height={12}
                            borderRadius={6}
                        />
                    )}
                </View>
            ))}

            {/* Button Skeleton */}
            <SkeletonLoader
                width="100%"
                height={48}
                borderRadius={12}
                style={{ marginTop: gap * 2 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: PremiumColors.dark,
    },
    placeholder: {
        padding: 16,
    },
});
