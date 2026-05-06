import { Banknote, CreditCard, Smartphone, Building2, type LucideIcon } from 'lucide-react';

export interface PaymentMethodConfig {
  readonly id: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly requiresTransactionId: boolean;
  readonly transactionIdLabel: string;
  readonly enabled: boolean;
}

/**
 * Single source of truth for payment methods.
 *
 * To add a new payment method:
 *   1. Add it here
 *   2. Add the enum value in prisma schema (PaymentMethod enum)
 *   3. Run migration
 *   Done — frontend and invoice auto-adapt.
 *
 * To remove:
 *   1. Set enabled: false (or remove the entry)
 *   2. Existing sales with that method still display correctly
 */
export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'CASH',
    label: 'Cash',
    icon: Banknote,
    requiresTransactionId: false,
    transactionIdLabel: '',
    enabled: true,
  },
  {
    id: 'BKASH',
    label: 'bKash',
    icon: Smartphone,
    requiresTransactionId: true,
    transactionIdLabel: 'bKash Transaction ID',
    enabled: true,
  },
  {
    id: 'NAGAD',
    label: 'Nagad',
    icon: Smartphone,
    requiresTransactionId: true,
    transactionIdLabel: 'Nagad Transaction ID',
    enabled: true,
  },
  {
    id: 'ROCKET',
    label: 'Rocket',
    icon: Smartphone,
    requiresTransactionId: true,
    transactionIdLabel: 'Rocket Transaction ID',
    enabled: false,
  },
  {
    id: 'CARD',
    label: 'Card',
    icon: CreditCard,
    requiresTransactionId: true,
    transactionIdLabel: 'Card Last 4 Digits / Ref',
    enabled: true,
  },
  {
    id: 'BANK_TRANSFER',
    label: 'Bank Transfer',
    icon: Building2,
    requiresTransactionId: true,
    transactionIdLabel: 'Bank Reference Number',
    enabled: false,
  },
];

export function getEnabledPaymentMethods(): PaymentMethodConfig[] {
  return PAYMENT_METHODS.filter((m) => m.enabled);
}

export function getPaymentMethodById(id: string): PaymentMethodConfig | undefined {
  return PAYMENT_METHODS.find((m) => m.id === id);
}

export function getPaymentLabel(id: string): string {
  return getPaymentMethodById(id)?.label ?? id;
}
