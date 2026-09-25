import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';

const CODE_LENGTH = 4;

export default function VerifyScreen() {
  const { name, phone } = useLocalSearchParams<{ name: string; phone: string }>();
  const { signIn } = useAppStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const verify = () => {
    if (code.length !== CODE_LENGTH) return;
    setLoading(true);
    // Démo : tout code à 4 chiffres est accepté. À brancher sur le service SMS/OTP.
    setTimeout(() => signIn({ name: name ?? 'Client', phone: phone ?? '' }), 700);
  };

  return (
    <SafeAreaView style={styles.fill}>
      <View style={styles.content}>
        <IconButton icon="arrow-back" label="Retour" onPress={() => router.back()} />
        <Text style={styles.title}>Code de vérification</Text>
        <Text style={styles.subtitle}>
          Saisissez le code envoyé au <Text style={styles.strong}>{phone}</Text>
        </Text>

        <Pressable style={styles.cells} onPress={() => inputRef.current?.focus()}>
          {Array.from({ length: CODE_LENGTH }, (_, i) => {
            const active = i === code.length;
            return (
              <View key={i} style={[styles.cell, active && styles.cellActive, !!code[i] && styles.cellFilled]}>
                <Text style={styles.cellText}>{code[i] ?? ''}</Text>
              </View>
            );
          })}
        </Pressable>
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, CODE_LENGTH))}
          keyboardType="number-pad"
          autoFocus
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          style={styles.hiddenInput}
          onSubmitEditing={verify}
        />

        <Text style={styles.hint}>Mode démo : saisissez n’importe quel code à 4 chiffres.</Text>

        <Pressable disabled={seconds > 0} onPress={() => setSeconds(30)}>
          <Text style={[styles.resend, seconds > 0 && { color: Colors.muted }]}>
            {seconds > 0 ? `Renvoyer le code dans ${seconds} s` : 'Renvoyer le code'}
          </Text>
        </Pressable>
      </View>
      <View style={styles.footer}>
        <Button title="Vérifier" onPress={verify} disabled={code.length !== CODE_LENGTH} loading={loading} variant="dark" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: Colors.card },
  content: { flex: 1, padding: Spacing.xl, gap: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.ink, marginTop: Spacing.xl, letterSpacing: -0.5 },
  subtitle: { fontSize: FontSize.md, color: Colors.muted, lineHeight: 22 },
  strong: { color: Colors.ink, fontWeight: '700' },
  cells: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
  cell: {
    flex: 1,
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActive: { borderColor: Colors.primary },
  cellFilled: { backgroundColor: Colors.primarySoft },
  cellText: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.ink },
  hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },
  hint: { fontSize: FontSize.sm, color: Colors.muted, marginTop: Spacing.lg },
  resend: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.blue, marginTop: Spacing.sm },
  footer: { padding: Spacing.xl },
});
