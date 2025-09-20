# Font Configuration Guide

This guide explains how to use the comprehensive font system configured in your React Native Expo app.

## Available Fonts

### Onest Font Family

- **Thin** (100)
- **ExtraLight** (200)
- **Light** (300)
- **Regular** (400)
- **Medium** (500)
- **SemiBold** (600)
- **Bold** (700)
- **ExtraBold** (800)
- **Black** (900)

### Open Sans Font Family

- **Light** (300)
- **Regular** (400)
- **Medium** (500)
- **SemiBold** (600)
- **Bold** (700)
- **ExtraBold** (800)

### Open Sans Condensed Font Family

- **Light** (300)
- **Regular** (400)
- **Medium** (500)
- **SemiBold** (600)
- **Bold** (700)
- **ExtraBold** (800)

### Open Sans SemiCondensed Font Family

- **Light** (300)
- **Regular** (400)
- **Medium** (500)
- **SemiBold** (600)
- **Bold** (700)
- **ExtraBold** (800)

### Variable Fonts

- **OpenSans Variable** - Supports weights 100-800
- **OpenSans Italic Variable** - Supports weights 100-800 with italic style

## Usage Methods

### 1. Tailwind CSS Classes (Recommended)

```tsx
// Onest fonts
<Text className="font-onest-thin">Onest Thin</Text>
<Text className="font-onest-extralight">Onest ExtraLight</Text>
<Text className="font-onest-light">Onest Light</Text>
<Text className="font-onest">Onest Regular</Text>
<Text className="font-onest-medium">Onest Medium</Text>
<Text className="font-onest-semibold">Onest SemiBold</Text>
<Text className="font-onest-bold">Onest Bold</Text>
<Text className="font-onest-extrabold">Onest ExtraBold</Text>
<Text className="font-onest-black">Onest Black</Text>

// Open Sans fonts
<Text className="font-opensans-light">Open Sans Light</Text>
<Text className="font-opensans">Open Sans Regular</Text>
<Text className="font-opensans-medium">Open Sans Medium</Text>
<Text className="font-opensans-semibold">Open Sans SemiBold</Text>
<Text className="font-opensans-bold">Open Sans Bold</Text>
<Text className="font-opensans-extrabold">Open Sans ExtraBold</Text>

// Open Sans Condensed fonts
<Text className="font-opensans-condensed-light">Open Sans Condensed Light</Text>
<Text className="font-opensans-condensed">Open Sans Condensed Regular</Text>
<Text className="font-opensans-condensed-medium">Open Sans Condensed Medium</Text>
<Text className="font-opensans-condensed-semibold">Open Sans Condensed SemiBold</Text>
<Text className="font-opensans-condensed-bold">Open Sans Condensed Bold</Text>
<Text className="font-opensans-condensed-extrabold">Open Sans Condensed ExtraBold</Text>

// Open Sans SemiCondensed fonts
<Text className="font-opensans-semicondensed-light">Open Sans SemiCondensed Light</Text>
<Text className="font-opensans-semicondensed">Open Sans SemiCondensed Regular</Text>
<Text className="font-opensans-semicondensed-medium">Open Sans SemiCondensed Medium</Text>
<Text className="font-opensans-semicondensed-semibold">Open Sans SemiCondensed SemiBold</Text>
<Text className="font-opensans-semicondensed-bold">Open Sans SemiCondensed Bold</Text>
<Text className="font-opensans-semicondensed-extrabold">Open Sans SemiCondensed ExtraBold</Text>
```

### 2. StyleSheet with FONT_STYLES

```tsx
import { FONT_STYLES } from '../utils/fonts';

const styles = StyleSheet.create({
  heading: {
    ...FONT_STYLES.onest.bold,
    fontSize: 24,
  },
  bodyText: {
    ...FONT_STYLES.opensans.regular,
    fontSize: 16,
  },
  caption: {
    ...FONT_STYLES.opensansCondensed.regular,
    fontSize: 12,
  },
});

<Text style={styles.heading}>Bold Heading</Text>
<Text style={styles.bodyText}>Regular body text</Text>
<Text style={styles.caption}>Small caption text</Text>
```

### 3. Utility Functions

```tsx
import { getOnestFont, getOpenSansFont, getOpenSansCondensedFont, getOpenSansSemiCondensedFont } from '../utils/fonts';

<Text style={{ fontFamily: getOnestFont('semibold') }}>Onest SemiBold</Text>
<Text style={{ fontFamily: getOpenSansFont('medium') }}>Open Sans Medium</Text>
<Text style={{ fontFamily: getOpenSansCondensedFont('bold') }}>Open Sans Condensed Bold</Text>
<Text style={{ fontFamily: getOpenSansSemiCondensedFont('extrabold') }}>Open Sans SemiCondensed ExtraBold</Text>
```

### 4. Direct Font Constants

```tsx
import { FONTS } from '../utils/fonts';

<Text style={{ fontFamily: FONTS.ONEST_BOLD }}>Onest Bold</Text>
<Text style={{ fontFamily: FONTS.OPENSANS_SEMIBOLD }}>Open Sans SemiBold</Text>
<Text style={{ fontFamily: FONTS.OPENSANS_CONDENSED_MEDIUM }}>Open Sans Condensed Medium</Text>
```

### 5. Variable Fonts

```tsx
import { FONTS } from '../utils/fonts';

// Regular variable font with different weights
<Text style={{ fontFamily: FONTS.OPENSANS_VARIABLE, fontWeight: '300' }}>Light (300)</Text>
<Text style={{ fontFamily: FONTS.OPENSANS_VARIABLE, fontWeight: '400' }}>Regular (400)</Text>
<Text style={{ fontFamily: FONTS.OPENSANS_VARIABLE, fontWeight: '600' }}>SemiBold (600)</Text>
<Text style={{ fontFamily: FONTS.OPENSANS_VARIABLE, fontWeight: '700' }}>Bold (700)</Text>

// Italic variable font
<Text style={{
  fontFamily: FONTS.OPENSANS_ITALIC_VARIABLE,
  fontWeight: '400',
  fontStyle: 'italic'
}}>
  Italic Regular (400)
</Text>
```

## Best Practices

### Typography Hierarchy

```tsx
// Headings - Use Onest for strong, modern headings
<Text style={[styles.h1, FONT_STYLES.onest.bold]}>Main Heading</Text>
<Text style={[styles.h2, FONT_STYLES.onest.medium]}>Sub Heading</Text>
<Text style={[styles.h3, FONT_STYLES.onest.semibold]}>Section Heading</Text>

// Body Text - Use Open Sans for readability
<Text style={[styles.body, FONT_STYLES.opensans.regular]}>Body text</Text>
<Text style={[styles.bodyBold, FONT_STYLES.opensans.semibold]}>Emphasized text</Text>

// Captions - Use Condensed for space efficiency
<Text style={[styles.caption, FONT_STYLES.opensansCondensed.regular]}>Caption text</Text>

// Buttons - Use Onest for strong call-to-action
<Text style={[styles.button, FONT_STYLES.onest.semibold]}>Button Text</Text>
```

### Common Use Cases

```tsx
// Navigation headers
<Text className="font-onest-bold text-xl">Screen Title</Text>

// Card titles
<Text className="font-onest-medium text-lg">Card Title</Text>

// Body content
<Text className="font-opensans text-base leading-6">Long paragraph content...</Text>

// Form labels
<Text className="font-opensans-semibold text-sm">Form Label</Text>

// Error messages
<Text className="font-opensans-medium text-sm text-red-500">Error message</Text>

// Success messages
<Text className="font-opensans-medium text-sm text-green-500">Success message</Text>

// Timestamps
<Text className="font-opensans-condensed text-xs text-gray-500">2 hours ago</Text>
```

### Responsive Typography

```tsx
import { useWindowDimensions } from "react-native";

function ResponsiveText() {
  const { width } = useWindowDimensions();

  const getFontSize = () => {
    if (width < 375) return 14; // Small screens
    if (width < 768) return 16; // Medium screens
    return 18; // Large screens
  };

  return (
    <Text style={[FONT_STYLES.opensans.regular, { fontSize: getFontSize() }]}>
      Responsive text that adapts to screen size
    </Text>
  );
}
```

## Font Loading

The fonts are automatically loaded in your `_layout.tsx` file using the `useCustomFonts` hook:

```tsx
import { useCustomFonts } from "./utils/fonts";

export default function RootLayout() {
  const { fontsLoaded, fontError } = useCustomFonts();

  if (fontError) {
    console.error("Font loading error:", fontError);
  }

  if (!fontsLoaded) {
    return null; // or a loading component
  }

  // Your app content
}
```

## Troubleshooting

### Font Not Loading

1. Check that the font file exists in `assets/fonts/`
2. Verify the font is listed in `app.json` under the expo-font plugin
3. Ensure the font name in the require statement matches the actual filename
4. Clear Metro cache: `npx expo start --clear`

### Font Not Displaying

1. Verify the font family name matches exactly (case-sensitive)
2. Check that fonts are loaded before rendering text
3. Use the FontExample component to test all fonts

### Performance

- Use static fonts for consistent performance
- Variable fonts are great for dynamic weight changes but may have slight performance overhead
- Consider using `font-display: swap` for web builds

## Example Component

See `app/components/FontExample.tsx` for a comprehensive demonstration of all font usage methods.
