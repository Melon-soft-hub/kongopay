import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { ListRow } from '@/components/ui/list-row';
import { SAVED_PLACES } from '@/constants/places';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { confirmAsync, notify } from '@/lib/dialogs';
import { formatPhone } from '@/lib/format';
import { useAppStore } from '@/store/app-store';

const REFERRAL_CODE = 'NAYO-KIN24';

export default function ProfileScreen() {
  const { user, history, signOut } = useAppStore();
  const trips = history.filter((r) => r.status === 'completed').length;
  const phone = user?.phone ?? '';

  const logout = async () => {
    if (await confirmAsync('Se déconnecter ?', 'Vos données locales seront effacées de cet appareil.', 'Se déconnecter')) {
      signOut();
    }
  };

  const soon = (feature: string) => notify(feature, 'Cette fonctionnalité arrive bientôt dans Trans-nayo.');

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar name={user?.name ?? ''} size={72} />
          <View style={styles.fill}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.phone}>+243 {formatPhone(phone.replace('+243', ''))}</Text>
            <View style={styles.badges}>
              <View style={styles.badge}>
                <Ionicons name="star" size={12} color={Colors.primaryDark} />
                <Text style={styles.badgeText}>4,9</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="car" size={12} color={Colors.ink} />
                <Text style={styles.badgeText}>{trips} courses</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.referral}>
          <View style={styles.fill}>
            <Text style={styles.referralTitle}>Invitez vos proches</Text>
            <Text style={styles.referralText}>2 000 FC offerts pour vous et votre ami·e à sa première course.</Text>
          </View>
          <Ionicons
            name="gift"
            size={36}
            color={Colors.primary}
            onPress={() =>
              Share.share({ message: `Rejoins-moi sur Trans-nayo avec le code ${REFERRAL_CODE} et gagne 2 000 FC !` })
            }
          />
        </View>

        <Text style={styles.section}>Adresses enregistrées</Text>
        <View style={styles.card}>
          {SAVED_PLACES.map((p) => (
            <ListRow
              key={p.id}
              icon={p.icon === 'home' ? 'home-outline' : 'briefcase-outline'}
              title={p.name}
              subtitle={p.address}
              onPress={() => soon('Modifier une adresse')}
            />
          ))}
          <ListRow icon="add" title="Ajouter une adresse" onPress={() => soon('Ajouter une adresse')} />
        </View>

        <Text style={styles.section}>Compte</Text>
        <View style={styles.card}>
          <ListRow icon="shield-checkmark-outline" title="Sécurité et contacts d’urgence" onPress={() => soon('Sécurité')} />
          <ListRow icon="notifications-outline" title="Notifications" onPress={() => soon('Notifications')} />
          <ListRow
            icon="language-outline"
            title="Langue"
            trailing={<Text style={styles.value}>Français</Text>}
            onPress={() => soon('Langue (Lingala, Swahili, English)')}
          />
          <ListRow icon="help-buoy-outline" title="Aide et assistance" onPress={() => soon('Assistance')} />
        </View>

        <Text style={styles.section}>Trans-nayo</Text>
        <View style={styles.card}>
          <ListRow
            icon="car-sport-outline"
            iconBackground={Colors.primarySoft}
            title="Devenir chauffeur"
            subtitle="Gagnez de l’argent avec votre véhicule"
            onPress={() => soon('Devenir chauffeur')}
          />
          <ListRow icon="document-text-outline" title="Conditions et confidentialité" onPress={() => soon('Conditions')} />
          <ListRow icon="log-out-outline" iconColor={Colors.red} iconBackground={Colors.redSoft} title="Se déconnecter" onPress={logout} showChevron={false} />
        </View>

        <Text style={styles.version}>Trans-nayo · version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  fill: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, paddingVertical: Spacing.md },
  name: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.ink },
  phone: { fontSize: FontSize.sm, color: Colors.muted, marginTop: 2 },
  badges: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.card,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  badgeText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.ink },
  referral: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.ink,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  referralTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.white },
  referralText: { fontSize: FontSize.sm, color: '#B7C2D6', marginTop: 2 },
  section: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Spacing.md,
  },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, paddingVertical: Spacing.xs },
  value: { fontSize: FontSize.sm, color: Colors.muted },
  version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.muted, marginTop: Spacing.lg },
});
