import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { getVehicle } from '@/constants/vehicles';
import { formatDate, formatMoney } from '@/lib/format';
import { useAppStore, type Ride } from '@/store/app-store';

export default function ActivityScreen() {
  const { history, setPickup, setDestination } = useAppStore();
  const completed = history.filter((r) => r.status === 'completed');
  const spent = completed.reduce((sum, r) => sum + r.price + (r.tip ?? 0), 0);

  const rebook = (ride: Ride) => {
    setPickup(ride.pickup);
    setDestination(ride.destination);
    router.push('/ride/options');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={history}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Vos trajets</Text>
            <View style={styles.stats}>
              <Stat label="Courses" value={String(completed.length)} />
              <Stat label="Dépensé" value={formatMoney(spent)} />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="car-outline" size={40} color={Colors.muted} />
            <Text style={styles.emptyText}>Aucun trajet pour le moment.</Text>
          </View>
        }
        renderItem={({ item }) => <RideCard ride={item} onRebook={() => rebook(item)} />}
      />
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function RideCard({ ride, onRebook }: { ride: Ride; onRebook: () => void }) {
  const vehicle = getVehicle(ride.vehicleId);
  const cancelled = ride.status === 'cancelled';
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.vehicleIcon}>
          <Ionicons name={vehicle.icon} size={22} color={Colors.ink} />
        </View>
        <View style={styles.fill}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {ride.destination.name}
          </Text>
          <Text style={styles.cardMeta}>
            {formatDate(ride.createdAt)} · {vehicle.name}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={[styles.price, cancelled && styles.strike]}>{formatMoney(ride.price + (ride.tip ?? 0))}</Text>
          {cancelled ? (
            <Text style={styles.cancelled}>Annulée</Text>
          ) : ride.rating ? (
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color={Colors.primaryDark} />
              <Text style={styles.cardMeta}>{ride.rating}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.route}>
        <View style={styles.dotPickup} />
        <Text style={styles.routeText} numberOfLines={1}>
          {ride.pickup.name}
        </Text>
      </View>
      <View style={styles.route}>
        <View style={styles.dotDest} />
        <Text style={styles.routeText} numberOfLines={1}>
          {ride.destination.address}
        </Text>
      </View>
      <Pressable style={styles.rebook} onPress={onRebook}>
        <Ionicons name="refresh" size={16} color={Colors.ink} />
        <Text style={styles.rebookText}>Refaire ce trajet</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  fill: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.md },
  header: { gap: Spacing.lg, marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.ink, letterSpacing: -0.5 },
  stats: { flexDirection: 'row', gap: Spacing.md },
  stat: { flex: 1, backgroundColor: Colors.ink, borderRadius: Radius.lg, padding: Spacing.lg },
  statValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: FontSize.sm, color: '#B7C2D6' },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.sm },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: 4 },
  vehicleIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.ink },
  cardMeta: { fontSize: FontSize.xs, color: Colors.muted },
  cardRight: { alignItems: 'flex-end', gap: 2 },
  price: { fontSize: FontSize.md, fontWeight: '800', color: Colors.ink },
  strike: { textDecorationLine: 'line-through', color: Colors.muted },
  cancelled: { fontSize: FontSize.xs, color: Colors.red, fontWeight: '600' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  route: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dotPickup: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.blue },
  dotDest: { width: 8, height: 8, borderRadius: 2, backgroundColor: Colors.ink },
  routeText: { flex: 1, fontSize: FontSize.sm, color: Colors.inkSoft },
  rebook: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
  },
  rebookText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.ink },
  empty: { alignItems: 'center', gap: Spacing.sm, padding: Spacing.xxl },
  emptyText: { color: Colors.muted, fontSize: FontSize.md },
});
