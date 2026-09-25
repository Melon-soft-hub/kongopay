import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

type Props = {
  icon?: ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
  iconBackground?: string;
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
};

export function ListRow({
  icon,
  iconColor = Colors.ink,
  iconBackground = Colors.background,
  leading,
  title,
  subtitle,
  trailing,
  onPress,
  showChevron = !!onPress,
}: Props) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: Colors.background }]}>
      {leading ??
        (icon ? (
          <View style={[styles.icon, { backgroundColor: iconBackground }]}>
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
        ) : null)}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
      {showChevron ? <Ionicons name="chevron-forward" size={18} color={Colors.muted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
  },
  icon: { width: 42, height: 42, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 2 },
  title: { fontSize: FontSize.md, fontWeight: '600', color: Colors.ink },
  subtitle: { fontSize: FontSize.sm, color: Colors.muted },
});
