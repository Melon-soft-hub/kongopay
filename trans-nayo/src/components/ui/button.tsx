import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

type Variant = 'primary' | 'dark' | 'outline' | 'ghost' | 'danger';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: ComponentProps<typeof Ionicons>['name'];
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

const VARIANTS: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: Colors.primary, fg: Colors.ink },
  dark: { bg: Colors.ink, fg: Colors.white },
  outline: { bg: Colors.card, fg: Colors.ink, border: Colors.line },
  ghost: { bg: 'transparent', fg: Colors.ink },
  danger: { bg: Colors.redSoft, fg: Colors.red },
};

export function Button({ title, onPress, variant = 'primary', icon, disabled, loading, style }: Props) {
  const v = VARIANTS[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: v.bg, borderColor: v.border ?? v.bg, opacity: inactive ? 0.5 : pressed ? 0.85 : 1 },
        pressed && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={20} color={v.fg} /> : null}
          <Text style={[styles.label, { color: v.fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  pressed: { transform: [{ scale: 0.98 }] },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: { fontSize: FontSize.md, fontWeight: '700' },
});
