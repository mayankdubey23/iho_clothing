import { PremiumColors } from '@/constants/theme';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

interface ParallaxHeroProps {
    children: React.ReactNode;
    imageHeight?: number;
    parallaxFactor?: number;
}

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export const ParallaxHero: React.FC<ParallaxHeroProps> = ({
    children,
    imageHeight = 300,
    parallaxFactor = 0.5,
}) => {
    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const imageAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: interpolate(
                        scrollY.value,
                        [0, imageHeight],
                        [0, imageHeight * parallaxFactor],
                        Extrapolate.CLAMP
                    ),
                },
            ],
        };
    });

    const overlayAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(
                scrollY.value,
                [0, imageHeight * 0.5],
                [0, 0.4],
                Extrapolate.CLAMP
            ),
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.heroContainer,
                    {
                        height: imageHeight,
                        overflow: 'hidden',
                    },
                ]}
            >
                <Animated.View style={[styles.heroImage, imageAnimatedStyle]}>
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: PremiumColors.dark,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        {/* Gradient overlay effect */}
                        <Animated.View
                            style={[
                                styles.overlay,
                                overlayAnimatedStyle,
                            ]}
                        />
                    </View>
                </Animated.View>
            </Animated.View>

            <Animated.ScrollView
                scrollEventThrottle={16}
                onScroll={scrollHandler}
                style={styles.scrollContent}
            >
                {children}
            </Animated.ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: PremiumColors.primary,
    },
    heroContainer: {
        overflow: 'hidden',
        backgroundColor: PremiumColors.dark,
    },
    heroImage: {
        ...StyleSheet.absoluteFillObject,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: PremiumColors.primary,
    },
    scrollContent: {
        flex: 1,
    },
});
