import React, { useCallback } from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ScaleCardProps {
    onPress?: () => void;
    children: React.ReactNode;
    style?: ViewStyle;
    scaleOnPress?: number;
    springConfig?: {
        damping?: number;
        mass?: number;
        overshootClamping?: boolean;
        restSpeedThreshold?: number;
        restDisplacementThreshold?: number;
    };
}

export const ScaleCard: React.FC<ScaleCardProps> = ({
    onPress,
    children,
    style,
    scaleOnPress = 0.97,
    springConfig = {
        damping: 10,
        mass: 1,
        overshootClamping: true,
    },
}) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const handlePressIn = useCallback(() => {
        scale.value = withSpring(scaleOnPress, springConfig);
        opacity.value = withTiming(0.8, { duration: 100 });
    }, [scale, opacity, scaleOnPress, springConfig]);

    const handlePressOut = useCallback(() => {
        scale.value = withSpring(1, springConfig);
        opacity.value = withTiming(1, { duration: 100 });
    }, [scale, opacity, springConfig]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <AnimatedTouchable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[animatedStyle, style]}
            activeOpacity={1}
        >
            {children}
        </AnimatedTouchable>
    );
};
