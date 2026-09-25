/** Formate un montant en francs congolais : 12500 → « 12 500 FC ». */
export function formatMoney(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? '-' : '';
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${sign}${digits} FC`;
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`;
}

export function formatDuration(minutes: number): string {
  const m = Math.max(1, Math.round(minutes));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h} h ${rest.toString().padStart(2, '0')}` : `${h} h`;
}

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} · ${time}`;
}

export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.replace(/(\d{3})(?=\d)/g, '$1 ');
}
