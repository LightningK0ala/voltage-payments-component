// Main factory class for creating Voltage Payment components
import type { PaymentOptions, PaymentComponent } from "./types/index";
import { PaymentInlineComponent } from "./components/PaymentInlineComponent";
import { PaymentModalComponent } from "./components/PaymentModalComponent";
import { PaymentButtonComponent } from "./components/PaymentButtonComponent";

export class VoltagePayments {
  static create(options: PaymentOptions): PaymentComponent {
    const variant = options.variant || "inline";

    switch (variant) {
      case "inline":
        return new PaymentInlineComponent(options);
      case "modal":
        return new PaymentModalComponent(options);
      case "button":
        return new PaymentButtonComponent(options);
      default:
        throw new Error(`Unknown payment variant: ${variant}`);
    }
  }

  static get version(): string {
    return "0.1.0";
  }
}
