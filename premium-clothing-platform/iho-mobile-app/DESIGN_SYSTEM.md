# 🎨 Premium Fashion Mobile App - Design System & Implementation

## Navigation Structure

### Bottom Tab Navigation
Your app now features a clean 5-tab navigation optimized for fashion retail:

```
🏠 Home      🔎 Discover    🛍 Shop    ❤️ Wishlist    👤 Profile
```

**Key Changes:**
- ✅ Removed dedicated Franchise tab (moved to Profile → "IHO Community")
- ✅ Updated labels: Store → Home, Explore → Discover, Cart → Shop
- ✅ Franchise Portal accessible for authenticated users in Profile

**File:** `src/app/(tabs)/_layout.tsx`

---

## Color System

### Premium Fashion Brand Colors

```
Primary:       #071327  (Dark Navy)        - Main background
Accent:        #F15A3D  (Warm Orange)     - Active states, CTAs, highlights
Text:          #FFFFFF  (White)           - All typography
Secondary:     #A0AEC0  (Soft Grey)       - Secondary text, disabled states
Dark:          #0A1B2E  (Darker Navy)     - Elevated surfaces, borders
Light:         #F8FAFC  (Off-white)       - Light backgrounds
```

### Usage

```typescript
import { PremiumColors } from '@/constants/theme';

// In components
backgroundColor: PremiumColors.primary,
color: PremiumColors.text,
borderColor: PremiumColors.secondary,
```

**File:** `src/constants/theme.ts`

---

## Typography System

### Font Families

**Headings (Bold, Editorial):**
- Bebas Neue (uppercase, impact headings)
- Anton (bold, alternative)
- Oswald (condensed headings)

**Body (Clean, Readable):**
- Inter (primary body text)
- Plus Jakarta Sans (alternative body)

### Font Sizes

- `xs`: 12px
- `sm`: 14px
- `base`: 16px (default)
- `lg`: 18px
- `xl`: 20px
- `2xl`: 24px
- `3xl`: 30px
- `4xl`: 36px
- `5xl`: 48px

### Font Weights

- `light`: 300
- `normal`: 400
- `medium`: 500
- `semibold`: 600
- `bold`: 700
- `extrabold`: 800
- `black`: 900

---

## Animation Components 🎬

### 1. ParallaxHero
Scroll parallax effects for hero sections with smooth depth perception.

```typescript
import { ParallaxHero } from '@/components/animations';

<ParallaxHero imageHeight={300} parallaxFactor={0.5}>
  <YourContent />
</ParallaxHero>
```

**Props:**
- `imageHeight` (default: 300)
- `parallaxFactor` (default: 0.5) - Intensity of parallax effect
- `children` - Content to display

**Use Case:** Hero sections on Home screen, Featured Products

---

### 2. ScaleCard
Spring-based card press animations with visual feedback.

```typescript
import { ScaleCard } from '@/components/animations';

<ScaleCard onPress={() => navigate('product')}>
  <ProductCard {...props} />
</ScaleCard>
```

**Props:**
- `onPress` - Callback when pressed
- `scaleOnPress` (default: 0.97) - Scale intensity
- `springConfig` - Spring animation config
- `children` - Card content

**Use Case:** Product cards, menu items, list items

---

### 3. MagneticButton
Gesture-based magnetic button that follows finger movements within a range.

```typescript
import { MagneticButton } from '@/components/animations';

<MagneticButton
  title="Add to Cart"
  variant="primary"
  size="lg"
  onPress={handleAddToCart}
  magneticRange={80}
/>
```

**Props:**
- `title` - Button text
- `variant` - 'primary' | 'secondary' | 'accent'
- `size` - 'sm' | 'md' | 'lg'
- `onPress` - Callback
- `magneticRange` (default: 80) - Gesture activation range

**Variants:**
- `primary` - Accent orange background
- `secondary` - Dark navy background
- `accent` - Navy with white text

**Use Case:** CTAs, "Add to Cart", "Buy Now", main actions

---

### 4. PullToRefresh
Animated pull-to-refresh with rotating refresh icon.

```typescript
import { PullToRefresh } from '@/components/animations';

<PullToRefresh
  onRefresh={async () => {
    await fetchProducts();
  }}
  refreshTriggerDistance={100}
>
  <ScrollContent />
</PullToRefresh>
```

**Props:**
- `onRefresh` - Async function called on refresh
- `refreshTriggerDistance` (default: 100) - Pull distance to trigger
- `children` - Scrollable content

**Use Case:** Home screen, Discover/Search results, Wishlist

---

### 5. SkeletonLoader & SkeletonPlaceholder
Shimmer loading placeholders for better UX during data fetching.

```typescript
import { SkeletonLoader, SkeletonPlaceholder } from '@/components/animations';

// Individual skeleton
<SkeletonLoader width="100%" height={20} borderRadius={8} />

// Predefined placeholder
<SkeletonPlaceholder rows={3} imageHeight={200} gap={12} />
```

**Props:**
- `width` - Container width
- `height` - Container height
- `borderRadius` - Border radius
- `shimmer` - Enable/disable animation

**Use Case:** While loading products, while fetching user data

---

### 6. SharedElement & ProductImageTransition
Shared element animations for product detail transitions.

```typescript
import { SharedElement, ProductImageTransition } from '@/components/animations';

// On product list
<SharedElement id={`product-${id}`}>
  <ProductImage source={image} />
</SharedElement>

// On product detail screen
<ProductImageTransition
  source={image}
  targetId={`product-${id}`}
/>
```

**Use Case:** Product list → Detail transitions, gallery animations

---

## Implementation Checklist

### Immediate (Required)
- [ ] Test navigation with new structure
- [ ] Verify premium colors render correctly
- [ ] Test animations in each component

### Short-term (1-2 weeks)
- [ ] Install custom fonts (Bebas Neue, Anton, Oswald, Inter, Plus Jakarta Sans)
- [ ] Update Home screen with ParallaxHero
- [ ] Update Product cards with ScaleCard
- [ ] Add SkeletonPlaceholder while loading products

### Medium-term (2-4 weeks)
- [ ] Implement PullToRefresh on main screens
- [ ] Add product detail transitions with SharedElement
- [ ] Replace placeholder CTAs with MagneticButton
- [ ] Update all brand colors throughout app

### Long-term (1-2 months)
- [ ] Create FlashList optimized product grids
- [ ] Implement advanced gesture interactions
- [ ] Add micro-interactions throughout app
- [ ] A/B test engagement metrics

---

## Color Palette Reference

```
Navy Gradient:
  Primary:     #071327 ●
  Dark:        #0A1B2E ●
  Light:       #F8FAFC ●

Accent Colors:
  Orange:      #F15A3D ●
  Grey:        #A0AEC0 ●
  White:       #FFFFFF ●
```

---

## Animation Performance Tips

1. **Use `scrollEventThrottle={16}`** in scroll animations
2. **Memoize animated components** with `React.memo()`
3. **Use `withSpring()` for natural motion** rather than linear animations
4. **Test on real devices** - Emulators can mask performance issues
5. **Profile with React Native Debugger** for animation frame drops

---

## Files Modified

- ✅ `src/constants/theme.ts` - Added premium colors & typography
- ✅ `src/app/(tabs)/_layout.tsx` - Updated navigation structure
- ✅ `src/app/(tabs)/profile.tsx` - Updated with premium styling
- ✅ `src/components/animations/` - 6 new animation components

---

## Quick Start: Using Components

```typescript
// Import
import {
  ParallaxHero,
  ScaleCard,
  MagneticButton,
  SkeletonLoader,
  PullToRefresh,
  SharedElement,
} from '@/components/animations';
import { PremiumColors } from '@/constants/theme';

// Use in component
export default function ProductScreen() {
  return (
    <PullToRefresh onRefresh={fetchProducts}>
      <ParallaxHero imageHeight={300}>
        <View>
          {products.map(product => (
            <ScaleCard key={product.id} onPress={() => goToDetail(product.id)}>
              <ProductCard {...product} />
            </ScaleCard>
          ))}
        </View>
      </ParallaxHero>
    </PullToRefresh>
  );
}
```

---

## Next: Custom Fonts Setup

To use the recommended fonts, follow this guide:

1. Download font files to `assets/fonts/`
2. Install expo-font: `npx expo install expo-font`
3. Update `app.json` with font configuration
4. Load fonts in app startup

See `expo-font` documentation for detailed setup: https://docs.expo.dev/versions/latest/sdk/font/
