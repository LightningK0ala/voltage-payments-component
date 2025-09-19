// Main API types for Voltage Payment Components

import type { PaymentKind as SdkPaymentKind } from "voltage-api-sdk";
export type PaymentKind = SdkPaymentKind;
export type PaymentVariant = "inline" | "modal" | "button";
export type PaymentTheme = "light" | "dark" | "auto";
export type PaymentStatus =
  | "generating"
  | "ready"
  | "processing"
  | "completed"
  | "failed"
  | "expired";

export interface AppearanceConfig {
  primaryColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: string;
  fontFamily?: string;
  textColor?: string;
  secondaryTextColor?: string;
}

export interface PollingConfig {
  maxAttempts?: number;
  intervalMs?: number;
  timeoutMs?: number;
}

export interface PaymentOptions {
  // Required Configuration
  apiKey: string;
  walletId: string;

  // Payment Configuration
  amount?: number; // BTC amount in msats, use 0 or null for "any amount" (bolt11 only)
  paymentKind?: PaymentKind;
  description?: string;
  currency?: "btc"; // For BTC flows only
  // Taproot Asset configuration (when paymentKind === 'taprootasset')
  assetCurrency?: string; // e.g. 'asset:<66-hex>' group key
  assetAmount?: number; // base units for the asset
  assetLabel?: string; // optional UI label, e.g., 'VCASH'
  assetDecimals?: number; // optional number of decimal places (e.g., VCASH = 6)

  // UI Configuration
  variant?: PaymentVariant;
  theme?: PaymentTheme;
  appearance?: AppearanceConfig;

  // Behavior Configuration
  autoClose?: boolean;
  showQRCode?: boolean;
  showCopyButton?: boolean;

  // Lifecycle Callbacks
  onReady?: (payment: PaymentData) => void;
  onQRGenerated?: (qrData: string, paymentRequest: string) => void;
  onStatusChange?: (status: PaymentStatus, payment: PaymentData) => void;
  onSuccess?: (payment: PaymentData) => void;
  onError?: (error: PaymentError) => void;
  onExpired?: (payment: PaymentData) => void;

  // Modal-specific Callbacks (only used when variant is "modal")
  onModalOpen?: () => void;
  onModalClose?: () => void;

  // Button-specific Callbacks (only used when variant is "button")
  onButtonActivated?: () => void;
  onButtonDeactivated?: () => void;

  // Advanced Configuration
  pollingConfig?: PollingConfig;
  organizationId?: string;
  environmentId?: string;
  baseUrl?: string; // Custom base URL for Voltage API (defaults to https://voltageapi.com/v1)
}

export interface PaymentData {
  id: string;
  status: PaymentStatus;
  paymentRequest?: string;
  address?: string;
  amount?: number;
  description?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface PaymentComponent {
  mount(selector: string | HTMLElement): Promise<void>;
  unmount(): void;
  destroy(): void;
  updateOptions(options: Partial<PaymentOptions>): void;
  getStatus(): PaymentStatus;
  getPaymentData(): PaymentData | null;
}
