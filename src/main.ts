// Main library entry point
export { VoltagePayments } from "./lib/VoltagePayments";
export type * from "./lib/types/index";

// Re-export common types for convenience
export type {
  PaymentOptions,
  PaymentComponent,
  PaymentStatus,
  AppearanceConfig,
} from "./lib/types/index";
