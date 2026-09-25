import { Platform, type ViewStyle } from 'react-native';

/**
 * Palette Trans-nayo : le jaune des taxis de Kinshasa, le bleu du drapeau
 * et un bleu nuit pour le texte et les boutons principaux.
 */
export const Colors = {
  ink: '#0F1B2D',
  inkSoft: '#3A4658',
  muted: '#7A8699',
  line: '#E7EAF0',
  background: '#F5F6FA',
  card: '#FFFFFF',
  primary: '#FFC727',
  primaryDark: '#E5AC00',
  primarySoft: '#FFF4D1',
  blue: '#0A7CFF',
  blueSoft: '#E3F0FF',
  red: '#E5383B',
  redSoft: '#FDE8E8',
  green: '#16A34A',
  greenSoft: '#DCFCE7',
  white: '#FFFFFF',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 36,
} as const;

export const Shadow: Record<'sm' | 'md' | 'lg', ViewStyle> = {
  sm: Platform.select<ViewStyle>({
    web: { boxShadow: '0 1px 3px rgba(15, 27, 45, 0.08)' },
    default: {
      shadowColor: '#0F1B2D',
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
  }),
  md: Platform.select<ViewStyle>({
    web: { boxShadow: '0 6px 18px rgba(15, 27, 45, 0.10)' },
    default: {
      shadowColor: '#0F1B2D',
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
  }),
  lg: Platform.select<ViewStyle>({
    web: { boxShadow: '0 -8px 30px rgba(15, 27, 45, 0.14)' },
    default: {
      shadowColor: '#0F1B2D',
      shadowOpacity: 0.14,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: -8 },
      elevation: 16,
    },
  }),
};
