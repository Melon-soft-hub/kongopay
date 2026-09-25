import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Redirect, router } from 'expo-router';
import { useEffect, useState, type ComponentProps } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RideMap } from '@/components/map/ride-map';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SheetHandle } from '@/components/ui/sheet-handle';
import { getPaymentMethod } from '@/constants/payments';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { getVehicle } from '@/constants/vehicles';
import { useRideSimulation, type RidePhase } from '@/hooks/use-ride-simulation';
import { confirmAsync, notify } from '@/lib/dialogs';
import { formatDuration, formatMoney } from '@/lib/format';
import { bearing } from '@/lib/geo';
import { useAppStore, type Ride } from '@/store/app-store';

const TITLES: Record<RidePhase, string> = {
  searching: 'Recherche d’un chauffeur…',
  arriving: 'Votre chauffeur arrive',
  arrived: 'Votre chauffeur est là',
  on_trip: 'En route',
  completed: 'Vous êtes à destination',
};

const APPROACH_MINUTES = 4;

function haptic() {
  if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export default function TrackingScreen() {
  const { activeRide } = useAppStore();
  // Copie locale : la course quitte le store dès qu'elle est terminée.
  const [ride] = useState(activeRide);
  if (!ride) return <Redirect href="/" />;
  return <Tracking ride={ride} />;
}

function Tracking({ ride }: { ride: Ride }) {
  const insets = useSafeAreaInsets();
  const { cancelRide, completeRide } = useAppStore();
  const [sheetHeight, setSheetHeight] = useState(0);
  const [pin] = useState(() => String(Math.floor(1000 + Math.random() * 9000)));
  const { phase, driver, progress, remainingRoute } = useRideSimulation(ride.pickup.coords, ride.destination.coords, true);

  const vehicle = getVehicle(ride.vehicleId);
  const payment = getPaymentMethod(ride.paymentId);
  const heading = driver && remainingRoute.length > 1 ? bearing(driver, remainingRoute[1]) : 0;

  useEffect(() => {
    if (phase === 'arriving' || phase === 'arrived') haptic();
    if (phase === 'completed') {
      haptic();
      completeRide();
      router.replace({ pathname: '/ride/complete', params: { id: ride.id } });
    }
  }, [phase, completeRide, ride.id]);

  const cancel = async () => {
    const ok = await confirmAsync(
      'Annuler la course ?',
      phase === 'searching' ? 'Aucun frais ne vous sera facturé.' : 'Le chauffeur est déjà en route vers vous.',
      'Annuler la course',
    );
    if (!ok) return;
    cancelRide();
    router.dismissTo('/');
  };

  const shareTrip = () =>
    Share.share({
      message: `Je suis en course Trans-nayo vers ${ride.destination.name} avec ${ride.driver.name} (${ride.driver.vehicle} ${ride.driver.color}, ${ride.driver.plate}).`,
    });

  const sos = async () => {
    const ok = await confirmAsync(
      'Alerte de sécurité',
      'Votre position et les détails de la course seront envoyés à vos contacts d’urgence et à l’équipe sécurité Trans-nayo.',
      'Envoyer l’alerte',
    );
    if (ok) notify('Alerte envoyée', 'L’équipe sécurité Trans-nayo vous rappelle dans un instant.');
  };

  const etaMinutes =
    phase === 'arriving'
      ? APPROACH_MINUTES * (1 - progress)
      : phase === 'on_trip'
        ? ride.durationMin * (1 - progress)
        : 0;

  return (
    <View style={styles.fill}>
      <RideMap
        pickup={ride.pickup.coords}
        destination={ride.destination.coords}
        driver={driver}
        driverHeading={heading}
        route={phase === 'searching' ? undefined : remainingRoute}
        bottomInset={sheetHeight}
        topInset={insets.top}
      />

      {phase === 'on_trip' ? (
        <Pressable style={[styles.sos, Shadow.md, { top: insets.top + Spacing.sm }]} onPress={sos}>
          <Ionicons name="shield" size={18} color={Colors.white} />
          <Text style={styles.sosText}>SOS</Text>
        </Pressable>
      ) : null}

      <View
        style={[styles.sheet, Shadow.lg, { paddingBottom: insets.bottom + Spacing.lg }]}
        onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}>
        <SheetHandle />

        <View style={styles.statusRow}>
          <View style={styles.fill}>
            <Text style={styles.title}>{TITLES[phase]}</Text>
            <Text style={styles.subtitle}>
              {phase === 'searching' && `${vehicle.name} · ${formatMoney(ride.price)}`}
              {phase === 'arriving' && `Arrivée dans ${formatDuration(etaMinutes)} · ${ride.pickup.name}`}
              {phase === 'arrived' && 'Rejoignez-le au point de prise en charge'}
              {phase === 'on_trip' && `${ride.destination.name} · arrivée dans ${formatDuration(etaMinutes)}`}
            </Text>
          </View>
          {phase === 'searching' ? <ActivityIndicator size="large" color={Colors.ink} /> : null}
          {phase === 'arrived' ? (
            <View style={styles.pin}>
              <Text style={styles.pinLabel}>Code</Text>
              <Text style={styles.pinValue}>{pin}</Text>
            </View>
          ) : null}
        </View>

        {phase !== 'searching' ? (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${Math.round((phase === 'arrived' ? 1 : progress) * 100)}%` },
                phase === 'on_trip' && { backgroundColor: Colors.green },
              ]}
            />
          </View>
        ) : null}

        {phase === 'searching' ? (
          <View style={styles.searching}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.searchDot, { opacity: 0.3 + i * 0.3 }]} />
            ))}
            <Text style={styles.searchingText}>Nous contactons les chauffeurs les plus proches de {ride.pickup.name}.</Text>
          </View>
        ) : (
          <View style={styles.driverCard}>
            <Avatar name={ride.driver.name} size={52} />
            <View style={styles.fill}>
              <Text style={styles.driverName}>{ride.driver.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color={Colors.primaryDark} />
                <Text style={styles.driverMeta}>
                  {ride.driver.rating.toFixed(1).replace('.', ',')} · {ride.driver.trips} courses
                </Text>
              </View>
              <Text style={styles.driverMeta}>
                {ride.driver.vehicle} · {ride.driver.color}
              </Text>
            </View>
            <View style={styles.plate}>
              <Text style={styles.plateText}>{ride.driver.plate}</Text>
            </View>
          </View>
        )}

        {phase !== 'searching' ? (
          <View style={styles.actions}>
            <Action icon="call" label="Appeler" onPress={() => Linking.openURL(`tel:${ride.driver.phone}`)} />
            <Action icon="chatbubble-ellipses" label="Message" onPress={() => Linking.openURL(`sms:${ride.driver.phone}`)} />
            <Action icon="share-social" label="Partager" onPress={shareTrip} />
            <Action icon="shield-checkmark" label="Sécurité" onPress={sos} />
          </View>
        ) : null}

        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {payment.name} · {formatMoney(ride.price)}
          </Text>
        </View>

        {phase === 'searching' || phase === 'arriving' || phase === 'arrived' ? (
          <Button title="Annuler la course" variant="danger" onPress={cancel} />
        ) : null}
      </View>
    </View>
  );
}

function Action({
  icon,
  label,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.action} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={20} color={Colors.ink} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  sos: {
    position: 'absolute',
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.red,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.lg,
    height: 44,
  },
  sosText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
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
    gap: Spacing.md,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  title: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.ink, letterSpacing: -0.3 },
  subtitle: { fontSize: FontSize.sm, color: Colors.muted, marginTop: 2 },
  pin: { backgroundColor: Colors.ink, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 6, alignItems: 'center' },
  pinLabel: { color: '#B7C2D6', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  pinValue: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: '800', letterSpacing: 2 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: Colors.background, overflow: 'hidden' },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  searching: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  searchDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primaryDark },
  searchingText: { flex: 1, fontSize: FontSize.sm, color: Colors.inkSoft, marginLeft: 6 },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.background,
  },
  driverName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.ink },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  driverMeta: { fontSize: FontSize.xs, color: Colors.muted },
  plate: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: Colors.ink,
  },
  plateText: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.ink, letterSpacing: 1 },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  action: { alignItems: 'center', gap: 4, flex: 1 },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: FontSize.xs, color: Colors.inkSoft, fontWeight: '600' },
  summary: { borderTopWidth: 1, borderTopColor: Colors.line, paddingTop: Spacing.sm },
  summaryText: { fontSize: FontSize.sm, color: Colors.inkSoft, fontWeight: '600' },
});
