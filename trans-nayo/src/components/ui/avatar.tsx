import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

const PALETTE = ['#0A7CFF', '#16A34A', '#E5383B', '#7C3AED', '#EA580C', '#0891B2'];

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function Avatar({ name, size = 48 }: { name: string; size?: number }) {
  const color = PALETTE[name.length % PALETTE.length];
  return (
    <View style={[styles.base, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials(name) || '?'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  text: { color: Colors.white, fontWeight: '700' },
});
