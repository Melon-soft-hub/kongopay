import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/icon-button';
import { ListRow } from '@/components/ui/list-row';
import { DEFAULT_LOCATION, PLACES, SAVED_PLACES, type Place } from '@/constants/places';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';

type Field = 'pickup' | 'destination';

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export default function SearchScreen() {
  const { pickup, setPickup, setDestination, history } = useAppStore();
  const [field, setField] = useState<Field>('destination');
  const [pickupQuery, setPickupQuery] = useState(pickup.id === DEFAULT_LOCATION.id ? '' : pickup.name);
  const [destQuery, setDestQuery] = useState('');
  const query = field === 'pickup' ? pickupQuery : destQuery;

  const recent = useMemo(() => {
    const seen = new Set<string>();
    return history
      .map((r) => r.destination)
      .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
      .slice(0, 3);
  }, [history]);

  const results = useMemo(() => {
    const all = [...(field === 'pickup' ? [DEFAULT_LOCATION] : []), ...SAVED_PLACES, ...PLACES];
    const q = normalize(query.trim());
    if (!q) return all;
    return all.filter((p) => normalize(`${p.name} ${p.address}`).includes(q));
  }, [field, query]);

  const choose = (place: Place) => {
    if (field === 'pickup') {
      setPickup(place);
      setPickupQuery(place.id === DEFAULT_LOCATION.id ? '' : place.name);
      setField('destination');
      return;
    }
    setDestination(place);
    router.replace('/ride/options');
  };

  return (
    <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton icon="close" label="Fermer" onPress={() => router.back()} />
        <Text style={styles.title}>Votre trajet</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.inputs}>
        <View style={styles.timeline}>
          <View style={styles.dotPickup} />
          <View style={styles.line} />
          <View style={styles.dotDest} />
        </View>
        <View style={styles.fields}>
          <TextInput
            value={pickupQuery}
            onChangeText={setPickupQuery}
            onFocus={() => setField('pickup')}
            placeholder={DEFAULT_LOCATION.name}
            placeholderTextColor={Colors.blue}
            style={[styles.input, field === 'pickup' && styles.inputActive]}
          />
          <TextInput
            value={destQuery}
            onChangeText={setDestQuery}
            onFocus={() => setField('destination')}
            placeholder="Où allez-vous ?"
            placeholderTextColor={Colors.muted}
            autoFocus
            style={[styles.input, field === 'destination' && styles.inputActive]}
          />
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(p) => p.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          field === 'destination' && !destQuery && recent.length ? (
            <View>
              <Text style={styles.section}>Récents</Text>
              {recent.map((p) => (
                <ListRow key={`r-${p.id}`} icon="time-outline" title={p.name} subtitle={p.address} onPress={() => choose(p)} showChevron={false} />
              ))}
              <Text style={styles.section}>Suggestions à Kinshasa</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="map-outline" size={32} color={Colors.muted} />
            <Text style={styles.emptyText}>Aucun lieu trouvé pour « {query} »</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ListRow
            icon={item.icon ?? 'location'}
            iconBackground={item.id === DEFAULT_LOCATION.id ? Colors.blueSoft : Colors.background}
            iconColor={item.id === DEFAULT_LOCATION.id ? Colors.blue : Colors.ink}
            title={item.name}
            subtitle={item.address}
            onPress={() => choose(item)}
            showChevron={false}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: Colors.card },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.ink },
  inputs: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.md },
  timeline: { alignItems: 'center', paddingVertical: 22 },
  dotPickup: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.blue },
  line: { flex: 1, width: 2, backgroundColor: Colors.line, marginVertical: 4 },
  dotDest: { width: 10, height: 10, borderRadius: 2, backgroundColor: Colors.ink },
  fields: { flex: 1, gap: Spacing.sm },
  input: {
    height: 50,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSize.md,
    color: Colors.ink,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputActive: { borderColor: Colors.primary, backgroundColor: Colors.card },
  list: { paddingBottom: Spacing.xxl },
  section: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  empty: { alignItems: 'center', gap: Spacing.sm, padding: Spacing.xxl },
  emptyText: { color: Colors.muted, fontSize: FontSize.md, textAlign: 'center' },
});
