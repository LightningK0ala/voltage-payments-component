// Main library entry point
export { VoltagePayments } from "./lib/VoltagePayments.js";
export type * from "./lib/types/index.js";

// Re-export common types for convenience
export type {
  PaymentOptions,
  PaymentComponent,
  PaymentStatus,
  AppearanceConfig,
} from "./lib/types/index.js"; 