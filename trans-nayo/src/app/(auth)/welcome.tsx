import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

const FEATURES: { icon: ComponentProps<typeof Ionicons>['name']; title: string; text: string }[] = [
  { icon: 'flash', title: 'Un chauffeur en 3 min', text: 'Moto, taxi, confort ou van, partout à Kinshasa.' },
  { icon: 'pricetag', title: 'Prix connu à l’avance', text: 'Pas de négociation, pas de surprise.' },
  { icon: 'phone-portrait', title: 'Mobile money', text: 'M-Pesa, Orange Money, Airtel Money ou espèces.' },
  { icon: 'shield-checkmark', title: 'Trajets sécurisés', text: 'Chauffeurs vérifiés, partage de trajet et SOS.' },
];

export default function WelcomeScreen() {
  return (
    <LinearGradient colors={[Colors.ink, '#16284A']} style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <View style={styles.hero}>
          <Logo size={56} light />
          <Text style={styles.title}>Bougez librement,{'\n'}à votre prix.</Text>
          <Text style={styles.subtitle}>« Na yo » : votre course, votre ville, votre façon de payer.</Text>
        </View>

        <View style={styles.sheet}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={20} color={Colors.ink} />
              </View>
              <View style={styles.featureBody}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            </View>
          ))}
          <Button title="Commencer" icon="arrow-forward" onPress={() => router.push('/login')} style={styles.cta} />
          <Text style={styles.legal}>En continuant, vous acceptez les conditions d’utilisation de Trans-nayo.</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  hero: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.xl, gap: Spacing.lg },
  title: { color: Colors.white, fontSize: FontSize.display, fontWeight: '800', lineHeight: 42, letterSpacing: -0.8 },
  subtitle: { color: '#B7C2D6', fontSize: FontSize.md, lineHeight: 22 },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  feature: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureBody: { flex: 1 },
  featureTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.ink },
  featureText: { fontSize: FontSize.sm, color: Colors.muted },
  cta: { marginTop: Spacing.sm },
  legal: { fontSize: FontSize.xs, color: Colors.muted, textAlign: 'center' },
});
