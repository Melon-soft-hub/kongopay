import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { Colors, Shadow } from '@/constants/theme';

/** Pastilles partagées par la carte native et la carte web. */
export function PickupPin() {
  return (
    <View style={styles.pickupOuter}>
      <View style={styles.pickupInner} />
    </View>
  );
}

export function DestinationPin() {
  return (
    <View style={styles.destination}>
      <View style={styles.destinationInner} />
    </View>
  );
}

export function DriverPin({ rotation = 0 }: { rotation?: number }) {
  return (
    <View style={[styles.driver, Shadow.md]}>
      {/* L'icône « navigate » pointe vers le nord-est : on compense de 45°. */}
      <View style={{ transform: [{ rotate: `${rotation - 45}deg` }] }}>
        <Ionicons name="navigate" size={18} color={Colors.ink} />
      </View>
    </View>
  );
}

export function NearbyCarPin() {
  return (
    <View style={[styles.nearby, Shadow.sm]}>
      <Ionicons name="car" size={16} color={Colors.ink} />
    </View>
  );
}

const styles = StyleSheet.create({
  nearby: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(10, 124, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.blue,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  destination: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationInner: { width: 8, height: 8, backgroundColor: Colors.primary, borderRadius: 1 },
  driver: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
