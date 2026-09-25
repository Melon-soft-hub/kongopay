import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getPaymentMethod } from '@/constants/payments';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { getVehicle } from '@/constants/vehicles';
import { formatDistance, formatDuration, formatMoney } from '@/lib/format';
import { useAppStore } from '@/store/app-store';

const TIPS = [0, 500, 1000, 2000];
const LABELS = ['', 'Mauvais', 'Moyen', 'Bien', 'Très bien', 'Parfait !'];

export default function RideCompleteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { history, rateRide } = useAppStore();
  const ride = history.find((r) => r.id === id);
  const [rating, setRating] = useState(5);
  const [tip, setTip] = useState(0);

  if (!ride) return <Redirect href="/" />;

  const payment = getPaymentMethod(ride.paymentId);

  const finish = () => {
    rateRide(ride.id, rating, tip);
    router.dismissTo('/');
  };

  return (
    <SafeAreaView style={styles.fill}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.check}>
          <Ionicons name="checkmark" size={40} color={Colors.ink} />
        </View>
        <Text style={styles.title}>Bienvenue à destination !</Text>
        <Text style={styles.subtitle}>{ride.destination.name}</Text>

        <View style={styles.card}>
          <Text style={styles.amount}>{formatMoney(ride.price + tip)}</Text>
          <Text style={styles.muted}>
            {payment.name}
            {ride.paymentId === 'cash' ? ' · à remettre au chauffeur' : ' · payé'}
          </Text>
          <View style={styles.divider} />
          <Row label="Course" value={formatMoney(ride.price)} />
          {tip ? <Row label="Pourboire" value={formatMoney(tip)} /> : null}
          <Row label="Service" value={getVehicle(ride.vehicleId).name} />
          <Row label="Distance" value={formatDistance(ride.distanceKm)} />
          <Row label="Durée" value={formatDuration(ride.durationMin)} />
        </View>

        <View style={styles.card}>
          <View style={styles.driverRow}>
            <Avatar name={ride.driver.name} size={44} />
            <View>
              <Text style={styles.driverName}>Comment était {ride.driver.name.split(' ')[0]} ?</Text>
              <Text style={styles.muted}>{LABELS[rating]}</Text>
            </View>
          </View>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setRating(n)} hitSlop={6} accessibilityLabel={`${n} étoiles`}>
                <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={38} color={Colors.primary} />
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Ajouter un pourboire</Text>
          <View style={styles.tips}>
            {TIPS.map((t) => (
              <Pressable key={t} onPress={() => setTip(t)} style={[styles.tip, tip === t && styles.tipActive]}>
                <Text style={[styles.tipText, tip === t && { color: Colors.white }]}>{t ? formatMoney(t) : 'Non'}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Terminer" variant="dark" onPress={finish} />
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, gap: Spacing.lg, alignItems: 'stretch' },
  check: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.ink, textAlign: 'center' },
  subtitle: { fontSize: FontSize.md, color: Colors.muted, textAlign: 'center', marginTop: -Spacing.sm },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.sm },
  amount: { fontSize: FontSize.display, fontWeight: '800', color: Colors.ink, letterSpacing: -1 },
  muted: { fontSize: FontSize.sm, color: Colors.muted },
  divider: { height: 1, backgroundColor: Colors.line, marginVertical: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  value: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.ink },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  driverName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.ink },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.inkSoft },
  tips: { flexDirection: 'row', gap: Spacing.sm },
  tip: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipActive: { backgroundColor: Colors.ink },
  tipText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.ink },
  footer: { padding: Spacing.xl, paddingTop: Spacing.sm },
});
