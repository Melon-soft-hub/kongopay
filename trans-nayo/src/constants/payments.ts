export type PaymentMethodId = 'cash' | 'wallet' | 'mpesa' | 'orange' | 'airtel';

export type PaymentMethod = {
  id: PaymentMethodId;
  name: string;
  description: string;
  color: string;
  /** Initiales affichées dans la pastille du moyen de paiement. */
  badge: string;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'cash', name: 'Espèces', description: 'Payez le chauffeur à l’arrivée', color: '#16A34A', badge: 'FC' },
  { id: 'wallet', name: 'Portefeuille Nayo', description: 'Solde de votre compte', color: '#0F1B2D', badge: 'TN' },
  { id: 'mpesa', name: 'M-Pesa', description: 'Vodacom', color: '#E60000', badge: 'M' },
  { id: 'orange', name: 'Orange Money', description: 'Orange RDC', color: '#FF7900', badge: 'OM' },
  { id: 'airtel', name: 'Airtel Money', description: 'Airtel RDC', color: '#D2001F', badge: 'AM' },
];

export function getPaymentMethod(id: PaymentMethodId): PaymentMethod {
  return PAYMENT_METHODS.find((p) => p.id === id) ?? PAYMENT_METHODS[0];
}
