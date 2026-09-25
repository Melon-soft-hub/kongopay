import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RideMap } from '@/components/map/ride-map';
import { Avatar } from '@/components/ui/avatar';
import { IconButton } from '@/components/ui/icon-button';
import { SheetHandle } from '@/components/ui/sheet-handle';
import { SAVED_PLACES, type Place } from '@/constants/places';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/constants/theme';
import { VEHICLES } from '@/constants/vehicles';
import { nearbyPoint } from '@/lib/geo';
import { useAppStore } from '@/store/app-store';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Mbote';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, pickup, setDestination } = useAppStore();
  const [sheetHeight, setSheetHeight] = useState(0);
  const firstName = user?.name.split(' ')[0] ?? '';

  const nearby = useMemo(
    () => Array.from({ length: 5 }, (_, i) => nearbyPoint(pickup.coords, 0.4 + i * 0.25)),
    [pickup],
  );

  const goTo = (place: Place) => {
    setDestination(place);
    router.push('/ride/options');
  };

  return (
    <View style={styles.fill}>
      <RideMap pickup={pickup.coords} nearbyDrivers={nearby} bottomInset={sheetHeight} topInset={insets.top} />

      <View style={[styles.topBar, { top: insets.top + Spacing.sm }]}>
        <Pressable style={[styles.greeting, Shadow.md]} onPress={() => router.push('/profile')}>
          <Avatar name={user?.name ?? ''} size={40} />
          <View>
            <Text style={styles.greetingSmall}>{greeting()} 👋</Text>
            <Text style={styles.greetingName}>{firstName}</Text>
          </View>
        </Pressable>
        <IconButton icon="notifications-outline" label="Notifications" size={52} style={Shadow.md} />
      </View>

      <View style={[styles.sheet, Shadow.lg]} onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}>
        <SheetHandle />
        <Text style={styles.sheetTitle}>Où allez-vous ?</Text>

        <Pressable style={styles.search} onPress={() => router.push('/search')} accessibilityRole="search">
          <Ionicons name="search" size={20} color={Colors.ink} />
          <Text style={styles.searchText} numberOfLines={1}>
            Rechercher un lieu
          </Text>
          <View style={styles.nowChip}>
            <Ionicons name="time" size={14} color={Colors.ink} />
            <Text style={styles.nowText}>Maintenant</Text>
          </View>
        </Pressable>

        <View style={styles.savedRow}>
          {SAVED_PLACES.map((place) => (
            <Pressable key={place.id} style={styles.saved} onPress={() => goTo(place)}>
              <View style={styles.savedIcon}>
                <Ionicons name={place.icon === 'home' ? 'home' : 'briefcase'} size={16} color={Colors.ink} />
              </View>
              <View style={styles.fill}>
                <Text style={styles.savedName}>{place.name}</Text>
                <Text style={styles.savedAddress} numberOfLines={1}>
                  {place.address}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.services}>
          {VEHICLES.map((v) => (
            <Pressable key={v.id} style={styles.service} onPress={() => router.push('/search')}>
              <View style={styles.serviceIcon}>
                <Ionicons name={v.icon} size={26} color={Colors.ink} />
              </View>
              <Text style={styles.serviceName}>{v.name.replace('Nayo ', '')}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.promo}>
          <Ionicons name="pricetag" size={18} color={Colors.primary} />
          <Text style={styles.promoText}>
            <Text style={styles.promoTitle}>-20 % </Text>sur votre 1re course moto · code NAYO20
          </Text>
        </View>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: Radius.pill,
    padding: 6,
    paddingRight: Spacing.lg,
  },
  greetingSmall: { fontSize: FontSize.xs, color: Colors.muted },
  greetingName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.ink },
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
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  sheetTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.ink, letterSpacing: -0.3 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: Colors.background,
    paddingLeft: Spacing.lg,
    paddingRight: 6,
  },
  searchText: { flex: 1, fontSize: FontSize.md, color: Colors.muted, fontWeight: '500' },
  nowChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.card,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    height: 40,
  },
  nowText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.ink },
  savedRow: { flexDirection: 'row', gap: Spacing.sm },
  saved: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  savedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.ink },
  savedAddress: { fontSize: FontSize.xs, color: Colors.muted },
  services: { flexDirection: 'row', gap: Spacing.sm },
  service: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  serviceIcon: {
    alignSelf: 'stretch',
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceName: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.ink },
  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.ink,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  promoTitle: { fontWeight: '800', color: Colors.primary },
  promoText: { flex: 1, fontSize: FontSize.sm, color: Colors.white },
});
