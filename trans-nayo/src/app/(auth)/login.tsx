import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { formatPhone } from '@/lib/format';

export default function LoginScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const digits = phone.replace(/\D/g, '');
  const valid = name.trim().length >= 2 && digits.length === 9;

  const submit = () => {
    if (!valid) return;
    router.push({ pathname: '/verify', params: { name: name.trim(), phone: `+243${digits}` } });
  };

  return (
    <SafeAreaView style={styles.fill}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <IconButton icon="arrow-back" label="Retour" onPress={() => router.back()} />
          <Text style={styles.title}>Créez votre compte</Text>
          <Text style={styles.subtitle}>Nous vous enverrons un code par SMS pour vérifier votre numéro.</Text>

          <Text style={styles.label}>Nom complet</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex. Marie Tshala"
            placeholderTextColor={Colors.muted}
            autoCapitalize="words"
            autoComplete="name"
            style={styles.input}
          />

          <Text style={styles.label}>Numéro de téléphone</Text>
          <View style={styles.phoneRow}>
            <View style={styles.prefix}>
              <Text style={styles.flag}>🇨🇩</Text>
              <Text style={styles.prefixText}>+243</Text>
            </View>
            <TextInput
              value={formatPhone(phone)}
              onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 9))}
              placeholder="812 345 678"
              placeholderTextColor={Colors.muted}
              keyboardType="phone-pad"
              autoComplete="tel"
              style={[styles.input, styles.phoneInput]}
              onSubmitEditing={submit}
            />
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Button title="Recevoir le code" onPress={submit} disabled={!valid} variant="dark" />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: Colors.card },
  content: { padding: Spacing.xl, gap: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.ink, marginTop: Spacing.xl, letterSpacing: -0.5 },
  subtitle: { fontSize: FontSize.md, color: Colors.muted, lineHeight: 22, marginBottom: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.inkSoft, marginTop: Spacing.md },
  input: {
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSize.md,
    color: Colors.ink,
  },
  phoneRow: { flexDirection: 'row', gap: Spacing.sm },
  prefix: {
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flag: { fontSize: 20 },
  prefixText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.ink },
  phoneInput: { flex: 1, letterSpacing: 1 },
  footer: { padding: Spacing.xl, paddingTop: Spacing.sm },
});
