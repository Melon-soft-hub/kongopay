import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Shadow } from '@/constants/theme';

type Props = {
  icon: ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  label: string;
  size?: number;
  color?: string;
  background?: string;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({ icon, onPress, label, size = 44, color = Colors.ink, background = Colors.card, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        Shadow.sm,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: background, opacity: pressed ? 0.8 : 1 },
        style,
      ]}>
      <Ionicons name={icon} size={size * 0.46} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
