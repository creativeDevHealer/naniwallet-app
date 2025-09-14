# Nani Wallet Color System

## Overview
This document outlines the unified color system for Nani Wallet, ensuring consistent visual design across the entire application.

## Theme Structure
The app uses a comprehensive theme system with both light and dark mode support. All colors are defined in `src/context/ThemeContext.tsx`.

## Color Categories

### 1. Primary Colors (Islamic Green Theme)
- **`primary`**: `#2E7D32` (Light) / `#4CAF50` (Dark) - Main brand color
- **`primaryDark`**: `#1B5E20` (Light) / `#2E7D32` (Dark) - Darker shade for contrast
- **`primaryLight`**: `#4CAF50` (Light) / `#66BB6A` (Dark) - Lighter shade for highlights

### 2. Secondary Colors (Gold Accent)
- **`secondary`**: `#FF8F00` (Light) / `#FFB300` (Dark) - Gold accent color
- **`secondaryDark`**: `#F57C00` (Light) / `#FF8F00` (Dark) - Darker gold
- **`secondaryLight`**: `#FFB300` (Light) / `#FFC107` (Dark) - Lighter gold

### 3. Background Colors
- **`background`**: Main app background
- **`backgroundSecondary`**: Secondary background for sections
- **`surface`**: Card and component backgrounds
- **`surfaceSecondary`**: Alternative surface color

### 4. Text Colors
- **`text`**: Primary text color
- **`textSecondary`**: Secondary text (descriptions, labels)
- **`textTertiary`**: Tertiary text (subtle information)
- **`textInverse`**: Text for dark backgrounds

### 5. Border Colors
- **`border`**: Standard borders
- **`borderLight`**: Subtle borders
- **`borderDark`**: Strong borders
- **`divider`**: Section dividers

### 6. Semantic Colors
- **`success`**: `#28A745` (Light) / `#4CAF50` (Dark) - Success states
- **`error`**: `#DC3545` (Light) / `#F44336` (Dark) - Error states
- **`warning`**: `#FFC107` (Light) / `#FF9800` (Dark) - Warning states
- **`info`**: `#007BFF` (Light) / `#2196F3` (Dark) - Information states

### 7. Action Colors
- **`accent`**: `#2E7D32` (Light) / `#4CAF50` (Dark) - Primary action buttons (matches primary green)
- **`danger`**: `#FF5A5F` (Light) / `#FF6B6B` (Dark) - Delete/close actions

### 8. Neutral Colors
Complete gray scale from `gray50` to `gray900` for consistent neutral tones.

## Usage Guidelines

### ✅ DO
```typescript
// Use theme colors in components
const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.border,
  },
  text: {
    color: theme.colors.text,
  },
});
```

### ❌ DON'T
```typescript
// Don't use hardcoded colors
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4C6FFF', // ❌ Hardcoded
    color: '#FF5A5F', // ❌ Hardcoded
  },
});
```

## Component Examples

### Buttons
```typescript
// Primary button (Green theme)
backgroundColor: theme.colors.accent  // Green: #2E7D32 / #4CAF50
color: theme.colors.white

// Secondary button
backgroundColor: 'transparent'
borderColor: theme.colors.border
color: theme.colors.text

// Danger button
backgroundColor: theme.colors.danger
color: theme.colors.white
```

### Cards
```typescript
backgroundColor: theme.colors.surface
borderColor: theme.colors.border
```

### Text
```typescript
// Primary text
color: theme.colors.text

// Secondary text
color: theme.colors.textSecondary

// Success text
color: theme.colors.success

// Error text
color: theme.colors.error
```

## Dark Mode Support
All colors automatically adapt between light and dark themes. No additional code is needed for dark mode support.

## Accessibility
Colors are chosen to meet WCAG contrast requirements:
- Text on backgrounds: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio

## Future Considerations
- Consider adding color variations for different user preferences
- Monitor color usage for consistency across new components
- All major components now use the unified green theme

