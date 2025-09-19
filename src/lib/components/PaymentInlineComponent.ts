// TypeScript wrapper for the PaymentInline Svelte component
import type {
  PaymentOptions,
  PaymentComponent,
  PaymentStatus,
  PaymentData,
} from "../types/index";

export class PaymentInlineComponent implements PaymentComponent {
  private svelteComponent: any = null;
  private container: HTMLElement | null = null;
  private options: PaymentOptions;

  constructor(options: PaymentOptions) {
    this.options = options;
  }

  async mount(selector: string | HTMLElement): Promise<void> {
    // Get the target element
    const target =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector;

    if (!target) {
      throw new Error(`Cannot find element: ${selector}`);
    }

    if (!(target instanceof HTMLElement)) {
      throw new Error("Target must be an HTMLElement");
    }

    this.container = target;

    // Dynamically import the Svelte component
    const PaymentInlineModule = await import("./PaymentInline.svelte" as any);
    const PaymentInline = PaymentInlineModule.default;

    // Create the Svelte component
    this.svelteComponent = new PaymentInline({
      target: this.container,
      props: {
        ...this.options,
        paymentKind: this.options.paymentKind || "bip21",
        description: this.options.description || "",
        appearance: this.options.appearance || {},
        theme: this.options.theme || "auto",
        showQRCode: this.options.showQRCode !== false,
        showCopyButton: this.options.showCopyButton !== false,
        pollingConfig: this.options.pollingConfig || {},
      },
    });

    // Set up event listeners for callbacks
    this.setupEventListeners();
  }

  unmount(): void {
    if (this.svelteComponent) {
      this.svelteComponent.$destroy();
      this.svelteComponent = null;
    }
    this.container = null;
  }

  destroy(): void {
    this.unmount();
  }

  updateOptions(newOptions: Partial<PaymentOptions>): void {
    this.options = { ...this.options, ...newOptions };

    if (this.svelteComponent) {
      // Update the Svelte component props
      this.svelteComponent.$set({
        ...this.options,
        paymentKind: this.options.paymentKind || "bip21",
        description: this.options.description || "",
        appearance: this.options.appearance || {},
        theme: this.options.theme || "auto",
        showQRCode: this.options.showQRCode !== false,
        showCopyButton: this.options.showCopyButton !== false,
        pollingConfig: this.options.pollingConfig || {},
      });
    }
  }

  getStatus(): PaymentStatus {
    // TODO: Get status from Svelte component
    return "generating";
  }

  getPaymentData(): PaymentData | null {
    // TODO: Get payment data from Svelte component
    return null;
  }

  private setupEventListeners(): void {
    if (!this.svelteComponent) return;

    // Listen to Svelte component events and call user callbacks
    this.svelteComponent.$on("ready", (event: any) => {
      this.options.onReady?.(event.detail);
    });

    this.svelteComponent.$on("qrGenerated", (event: any) => {
      const { qrData, paymentRequest } = event.detail;
      this.options.onQRGenerated?.(qrData, paymentRequest);
    });

    this.svelteComponent.$on("statusChange", (event: any) => {
      const { status, payment } = event.detail;
      this.options.onStatusChange?.(status, payment);
    });

    this.svelteComponent.$on("success", (event: any) => {
      this.options.onSuccess?.(event.detail);
    });

    this.svelteComponent.$on("error", (event: any) => {
      this.options.onError?.(event.detail);
    });

    this.svelteComponent.$on("expired", (event: any) => {
      this.options.onExpired?.(event.detail);
    });
  }
}
