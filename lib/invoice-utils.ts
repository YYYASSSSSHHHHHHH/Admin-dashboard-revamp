export const RECIPIENT_BANKS = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India',
  'Axis Bank',
  'Kotak Mahindra Bank',
] as const;

export const PAYMENT_MODES = ['Bank Transfer', 'Cash', 'Check', 'UPI / QR'] as const;

export type PaymentMode = (typeof PAYMENT_MODES)[number];
