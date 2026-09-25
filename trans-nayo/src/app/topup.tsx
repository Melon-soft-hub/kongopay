import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { PaymentBadge } from '@/components/ui/payment-badge';
import { PAYMENT_METHODS, type PaymentMethodId } from '@/constants/payments';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { formatMoney, formatPhone } from '@/lib/format';
import { useAppStore } from '@/store/app-store';

const AMOUNTS = [5000, 10000, 20000, 50000];
const PROVIDERS = PAYMENT_METHODS.filter((m) => m.id === 'mpesa' || m.id === 'orange' || m.id === 'airtel');
const MIN_AMOUNT = 1000;

export default function TopUpScreen() {
  const { user, topUp } = useAppStore();
  const [amount, setAmount] = useState('10000');
  const [provider, setProvider] = useState<PaymentMethodId>('mpesa');
  const [loading, setLoading] = useState(false);
  const value = Number(amount) || 0;
  const providerName = PROVIDERS.find((p) => p.id === provider)?.name ?? '';

  const submit = () => {
    if (value < MIN_AMOUNT) return;
    setLoading(true);
    // Démo : en production, on déclenche ici une demande de paiement USSD push
    // auprès de l'opérateur, puis on attend la confirmation du serveur.
    setTimeout(() => {
      topUp(value, `Recharge ${providerName}`);
      router.back();
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <IconButton icon="close" label="Fermer" onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Recharger</Text>
          <View style={{ width: 44 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.amountBox}>
            <TextInput
              value={amount}
              onChangeText={(t) => setAmount(t.replace(/\D/g, '').slice(0, 7))}
              keyboardType="number-pad"
              style={styles.amountInput}
              accessibilityLabel="Montant"
            />
            <Text style={styles.currency}>FC</Text>
          </View>
          <View style={styles.chips}>
            {AMOUNTS.map((a) => (
              <Pressable key={a} onPress={() => setAmount(String(a))} style={[styles.chip, value === a && styles.chipActive]}>
                <Text style={[styles.chipText, value === a && { color: Colors.white }]}>{formatMoney(a)}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Depuis</Text>
          {PROVIDERS.map((p) => (
            <Pressable key={p.id} onPress={() => setProvider(p.id)} style={[styles.provider, provider === p.id && styles.providerActive]}>
              <PaymentBadge method={p} />
              <View style={styles.fill}>
                <Text style={styles.providerName}>{p.name}</Text>
                <Text style={styles.providerPhone}>{formatPhone(user?.phone.replace('+243', '') ?? '')}</Text>
              </View>
              <Ionicons
                name={provider === p.id ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={provider === p.id ? Colors.green : Colors.line}
              />
            </Pressable>
          ))}
          <Text style={styles.hint}>
            Vous recevrez une demande de confirmation {providerName} sur votre téléphone. Saisissez votre code PIN pour valider.
          </Text>
        </ScrollView>
        <View style={styles.footer}>
          <Button
            title={value >= MIN_AMOUNT ? `Recharger ${formatMoney(value)}` : `Minimum ${formatMoney(MIN_AMOUNT)}`}
            variant="dark"
            onPress={submit}
            disabled={value < MIN_AMOUNT}
            loading={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.card },
  fill: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.ink },
  content: { padding: Spacing.lg, gap: Spacing.md },
  amountBox: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.lg },
  // Montant aligné à droite et devise à gauche : le groupe reste centré quelle que soit la longueur.
  amountInput: { flex: 1, minWidth: 0, fontSize: 48, fontWeight: '800', color: Colors.ink, textAlign: 'right', letterSpacing: -1 },
  currency: { flex: 1, fontSize: FontSize.xl, fontWeight: '700', color: Colors.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
  chip: { paddingHorizontal: Spacing.lg, height: 40, borderRadius: Radius.pill, backgroundColor: Colors.background, justifyContent: 'center' },
  chipActive: { backgroundColor: Colors.ink },
  chipText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.ink },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.inkSoft, marginTop: Spacing.lg },
  provider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.line,
  },
  providerActive: { borderColor: Colors.ink },
  providerName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.ink },
  providerPhone: { fontSize: FontSize.sm, color: Colors.muted },
  hint: { fontSize: FontSize.sm, color: Colors.muted, lineHeight: 20 },
  footer: { padding: Spacing.lg },
});
