import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

export function Logo({ size = 64, light = false }: { size?: number; light?: boolean }) {
  return (
    <View style={styles.row}>
      <View style={[styles.mark, { width: size, height: size, borderRadius: size * 0.3 }]}>
        <Ionicons name="navigate" size={size * 0.55} color={Colors.ink} />
      </View>
      <Text style={[styles.word, { fontSize: size * 0.5, color: light ? Colors.white : Colors.ink }]}>
        Trans<Text style={{ color: Colors.primary }}>-nayo</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mark: { backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] },
  word: { fontWeight: '800', letterSpacing: -0.5 },
});
