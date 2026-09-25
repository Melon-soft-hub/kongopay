import { StyleSheet, Text, View } from 'react-native';

import type { PaymentMethod } from '@/constants/payments';
import { Colors, Radius } from '@/constants/theme';

export function PaymentBadge({ method, size = 42 }: { method: PaymentMethod; size?: number }) {
  return (
    <View style={[styles.base, { width: size, height: size, backgroundColor: method.color }]}>
      <Text style={[styles.text, { fontSize: size * 0.32 }]}>{method.badge}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  text: { color: Colors.white, fontWeight: '800' },
});
