import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ListRow } from '@/components/ui/list-row';
import { PaymentBadge } from '@/components/ui/payment-badge';
import { PAYMENT_METHODS } from '@/constants/payments';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { formatDate, formatMoney } from '@/lib/format';
import { useAppStore } from '@/store/app-store';

export default function WalletScreen() {
  const { balance, transactions, paymentId, setPaymentMethod } = useAppStore();

  return (
    <SafeAreaView style={styles.fill} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Portefeuille</Text>

        <LinearGradient colors={[Colors.ink, '#1D3461']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
          <View style={styles.balanceTop}>
            <Text style={styles.balanceLabel}>Solde Trans-nayo</Text>
            <Ionicons name="wallet" size={22} color={Colors.primary} />
          </View>
          <Text style={styles.balance}>{formatMoney(balance)}</Text>
          <Text style={styles.balanceHint}>Payez vos courses en un geste, sans monnaie.</Text>
          <Button title="Recharger" icon="add-circle" onPress={() => router.push('/topup')} style={styles.topup} />
        </LinearGradient>

        <Text style={styles.section}>Moyen de paiement par défaut</Text>
        <View style={styles.card}>
          {PAYMENT_METHODS.map((m) => (
            <ListRow
              key={m.id}
              leading={<PaymentBadge method={m} />}
              title={m.name}
              subtitle={m.description}
              onPress={() => setPaymentMethod(m.id)}
              showChevron={false}
              trailing={
                <Ionicons
                  name={m.id === paymentId ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={m.id === paymentId ? Colors.ink : Colors.muted}
                />
              }
            />
          ))}
        </View>

        <Text style={styles.section}>Historique</Text>
        <View style={styles.card}>
          {transactions.map((t) => (
            <ListRow
              key={t.id}
              icon={t.amount > 0 ? 'arrow-down' : 'arrow-up'}
              iconBackground={t.amount > 0 ? Colors.greenSoft : Colors.background}
              iconColor={t.amount > 0 ? Colors.green : Colors.ink}
              title={t.label}
              subtitle={formatDate(t.createdAt)}
              trailing={
                <Text style={[styles.amount, t.amount > 0 && { color: Colors.green }]}>
                  {t.amount > 0 ? '+' : ''}
                  {formatMoney(t.amount)}
                </Text>
              }
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.ink, letterSpacing: -0.5 },
  balanceCard: { borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.xs },
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { color: '#B7C2D6', fontSize: FontSize.sm, fontWeight: '600' },
  balance: { color: Colors.white, fontSize: FontSize.display, fontWeight: '800', letterSpacing: -1 },
  balanceHint: { color: '#B7C2D6', fontSize: FontSize.sm },
  topup: { marginTop: Spacing.lg, height: 50 },
  section: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Spacing.md,
  },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, paddingVertical: Spacing.xs },
  amount: { fontSize: FontSize.md, fontWeight: '700', color: Colors.ink },
});
