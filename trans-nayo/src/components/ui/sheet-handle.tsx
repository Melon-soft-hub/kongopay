import { StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';

export function SheetHandle() {
  return <View style={styles.handle} />;
}

const styles = StyleSheet.create({
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: Colors.line, marginBottom: 12 },
});
