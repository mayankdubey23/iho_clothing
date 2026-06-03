import { PremiumColors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
    refreshTriggerDistance?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
    onRefresh,
    children,
    refreshTriggerDistance = 100,
}) => {
    const scrollY = useSharedValue(0);
    const isRefreshing = useSharedValue(false);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = -event.contentOffset.y;
        },
    });

    const handleRefresh = useCallback(async () => {
        isRefreshing.value = true;
        try {
            await onRefresh();
        } finally {
            isRefreshing.value = withSpring(0);
        }
    }, [onRefresh]);

    const headerAnimatedStyle = useAnimatedStyle(() => {
        const isRefreshTriggered = scrollY.value > refreshTriggerDistance;

        return {
            transform: [
                {
                    translateY: interpolate(
                        scrollY.value,
                        [0, refreshTriggerDistance],
                        [0, refreshTriggerDistance],
                        Extrapolate.CLAMP
                    ),
                },
                {
                    rotate: `${interpolate(
                        scrollY.value,
                        [0, refreshTriggerDistance],
                        [0, 360],
                        Extrapolate.CLAMP
                    )}deg`,
                },
            ],
            opacity: interpolate(
                scrollY.value,
                [0, refreshTriggerDistance / 2],
                [0.3, 1],
                Extrapolate.CLAMP
            ),
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.refreshHeader,
                    headerAnimatedStyle,
                ]}
            >
                <Animated.View style={headerAnimatedStyle}>
                    <Ionicons
                        name="refresh"
                        size={24}
                        color={PremiumColors.accent}
                    />
                </Animated.View>
            </Animated.View>

            <AnimatedScrollView
                scrollEventThrottle={16}
                onScroll={scrollHandler}
                onMomentumScrollEnd={() => {
                    if (scrollY.value > refreshTriggerDistance) {
                        handleRefresh();
                    }
                }}
                style={styles.scrollView}
            >
                {children}
            </AnimatedScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: PremiumColors.primary,
    },
    refreshHeader: {
        position: 'absolute',
        top: -60,
        left: 0,
        right: 0,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    scrollView: {
        flex: 1,
    },
});
