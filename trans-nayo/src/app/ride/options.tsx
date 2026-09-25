import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RideMap } from '@/components/map/ride-map';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { ListRow } from '@/components/ui/list-row';
import { PaymentBadge } from '@/components/ui/payment-badge';
import { SheetHandle } from '@/components/ui/sheet-handle';
import { getPaymentMethod, PAYMENT_METHODS } from '@/constants/payments';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { VEHICLES, type VehicleId } from '@/constants/vehicles';
import { formatDistance, formatDuration, formatMoney } from '@/lib/format';
import { buildRoute } from '@/lib/geo';
import { quoteRide } from '@/lib/pricing';
import { useAppStore } from '@/store/app-store';

export default function RideOptionsScreen() {
  const insets = useSafeAreaInsets();
  const { pickup, destination, paymentId, setPaymentMethod, balance, requestRide } = useAppStore();
  const [selected, setSelected] = useState<VehicleId>('taxi');
  const [sheetHeight, setSheetHeight] = useState(0);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const quotes = useMemo(
    () => (destination ? VEHICLES.map((v) => ({ vehicle: v, quote: quoteRide(v, pickup.coords, destination.coords) })) : []),
    [pickup, destination],
  );
  const route = useMemo(() => (destination ? buildRoute(pickup.coords, destination.coords) : []), [pickup, destination]);

  if (!destination) return <Redirect href="/" />;

  const current = quotes.find((q) => q.vehicle.id === selected) ?? quotes[0];
  const payment = getPaymentMethod(paymentId);
  const insufficient = paymentId === 'wallet' && balance < current.quote.price;

  const confirm = () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (requestRide(selected)) router.replace('/ride/tracking');
  };

  return (
    <View style={styles.fill}>
      <RideMap
        pickup={pickup.coords}
        destination={destination.coords}
        route={route}
        bottomInset={sheetHeight}
        topInset={insets.top}
      />

      <View style={[styles.topBar, { top: insets.top + Spacing.sm }]}>
        <IconButton icon="arrow-back" label="Retour" onPress={() => router.back()} size={48} style={Shadow.md} />
        <Pressable style={[styles.tripCard, Shadow.md]} onPress={() => router.push('/search')}>
          <Text style={styles.tripFrom} numberOfLines={1}>
            {pickup.name}
          </Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.muted} />
          <Text style={styles.tripTo} numberOfLines={1}>
            {destination.name}
          </Text>
        </Pressable>
      </View>

      <View
        style={[styles.sheet, Shadow.lg, { paddingBottom: insets.bottom + Spacing.lg }]}
        onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}>
        <SheetHandle />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Choisissez votre course</Text>
          <Text style={styles.sheetMeta}>
            {formatDistance(current.quote.distanceKm)} · ~{formatDuration(current.quote.durationMin)}
          </Text>
        </View>

        {quotes.map(({ vehicle, quote }) => {
          const active = vehicle.id === selected;
          return (
            <Pressable
              key={vehicle.id}
              onPress={() => setSelected(vehicle.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              style={[styles.vehicle, active && styles.vehicleActive]}>
              <View style={[styles.vehicleIcon, active && { backgroundColor: Colors.primary }]}>
                <Ionicons name={vehicle.icon} size={26} color={Colors.ink} />
              </View>
              <View style={styles.fill}>
                <View style={styles.vehicleNameRow}>
                  <Text style={styles.vehicleName}>{vehicle.name}</Text>
                  <Ionicons name="person" size={12} color={Colors.muted} />
                  <Text style={styles.vehicleSeats}>{vehicle.seats}</Text>
                </View>
                <Text style={styles.vehicleTagline} numberOfLines={1}>
                  {formatDuration(quote.durationMin)} · {vehicle.tagline}
                </Text>
              </View>
              <Text style={styles.vehiclePrice}>{formatMoney(quote.price)}</Text>
            </Pressable>
          );
        })}

        <Pressable style={styles.payment} onPress={() => setPaymentOpen(true)}>
          <PaymentBadge method={payment} size={32} />
          <Text style={styles.paymentName}>{payment.name}</Text>
          {paymentId === 'wallet' ? <Text style={styles.paymentBalance}>{formatMoney(balance)}</Text> : null}
          <Ionicons name="chevron-down" size={18} color={Colors.muted} />
        </Pressable>
        {insufficient ? (
          <Text style={styles.warning}>Solde insuffisant : rechargez votre portefeuille ou changez de moyen de paiement.</Text>
        ) : null}

        <Button
          title={`Commander ${current.vehicle.name} · ${formatMoney(current.quote.price)}`}
          variant="dark"
          onPress={confirm}
          disabled={insufficient}
        />
      </View>

      <Modal visible={paymentOpen} transparent animationType="slide" onRequestClose={() => setPaymentOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setPaymentOpen(false)} />
        <View style={[styles.modal, { paddingBottom: insets.bottom + Spacing.lg }]}>
          <SheetHandle />
          <Text style={styles.sheetTitle}>Moyen de paiement</Text>
          {PAYMENT_METHODS.map((m) => (
            <ListRow
              key={m.id}
              leading={<PaymentBadge method={m} />}
              title={m.name}
              subtitle={m.id === 'wallet' ? `Solde : ${formatMoney(balance)}` : m.description}
              onPress={() => {
                setPaymentMethod(m.id);
                setPaymentOpen(false);
              }}
              showChevron={false}
              trailing={
                m.id === paymentId ? <Ionicons name="checkmark-circle" size={24} color={Colors.green} /> : null
              }
            />
          ))}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topBar: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tripCard: {
    flex: 1,
    height: 48,
    borderRadius: Radius.pill,
    backgroundColor: Colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.lg,
  },
  tripFrom: { flexShrink: 1, fontSize: FontSize.sm, color: Colors.muted },
  tripTo: { flexShrink: 1, fontSize: FontSize.sm, fontWeight: '700', color: Colors.ink },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 },
  sheetTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.ink },
  sheetMeta: { fontSize: FontSize.sm, color: Colors.muted },
  vehicle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  vehicleActive: { borderColor: Colors.ink, backgroundColor: Colors.primarySoft },
  vehicleIcon: {
    width: 52,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  vehicleName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.ink, marginRight: 4 },
  vehicleSeats: { fontSize: FontSize.xs, color: Colors.muted },
  vehicleTagline: { fontSize: FontSize.xs, color: Colors.muted, marginTop: 2 },
  vehiclePrice: { fontSize: FontSize.md, fontWeight: '800', color: Colors.ink },
  payment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    marginTop: 4,
  },
  paymentName: { flex: 1, fontSize: FontSize.md, fontWeight: '600', color: Colors.ink },
  paymentBalance: { fontSize: FontSize.sm, color: Colors.muted },
  warning: { fontSize: FontSize.sm, color: Colors.red },
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 27, 45, 0.4)' },
  modal: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    gap: 4,
  },
});
