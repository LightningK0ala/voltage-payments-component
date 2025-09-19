// TypeScript wrapper for the PaymentModal Svelte component
import type {
  PaymentOptions,
  PaymentComponent,
  PaymentStatus,
  PaymentData,
} from "../types/index";

export class PaymentModalComponent implements PaymentComponent {
  private svelteComponent: any = null;
  private container: HTMLElement | null = null;
  private options: PaymentOptions;
  private triggerButton: HTMLElement | null = null;

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

    // For modal, we create a trigger button and mount the modal to body
    this.createTriggerButton();

    // Dynamically import the Svelte component
    const PaymentModalModule = await import("./PaymentModal.svelte" as any);
    const PaymentModal = PaymentModalModule.default;

    // Create the Svelte component and mount to body
    this.svelteComponent = new PaymentModal({
      target: document.body,
      props: {
        ...this.options,
        paymentKind: this.options.paymentKind || "bip21",
        description: this.options.description || "",
        appearance: this.options.appearance || {},
        theme: this.options.theme || "auto",
        showQRCode: this.options.showQRCode !== false,
        showCopyButton: this.options.showCopyButton !== false,
        pollingConfig: this.options.pollingConfig || {},
        autoClose: this.options.autoClose !== false,
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

    if (this.triggerButton && this.container) {
      this.container.removeChild(this.triggerButton);
      this.triggerButton = null;
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
        autoClose: this.options.autoClose !== false,
      });
    }

    // Update trigger button text if needed
    if (this.triggerButton && newOptions.description) {
      const buttonText = this.triggerButton.querySelector(
        ".voltage-modal-trigger-text"
      );
      if (buttonText) {
        buttonText.textContent = newOptions.description;
      }
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

  // Modal-specific public methods
  public open(): void {
    if (this.svelteComponent) {
      this.svelteComponent.open();
      this.options.onModalOpen?.();
    }
  }

  public close(): void {
    if (this.svelteComponent) {
      this.svelteComponent.close();
      this.options.onModalClose?.();
    }
  }

  private createTriggerButton(): void {
    if (!this.container) return;

    this.triggerButton = document.createElement("button");
    this.triggerButton.className = "voltage-modal-trigger";
    this.triggerButton.innerHTML = `
      <svg class="voltage-modal-trigger-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
      <span class="voltage-modal-trigger-text">
        ${this.options.description || "Pay with Bitcoin"}
      </span>
    `;

    // Add click handler to open modal
    this.triggerButton.addEventListener("click", () => {
      this.open();
    });

    // Add some default styles
    this.addTriggerButtonStyles();

    // Append to container
    this.container.appendChild(this.triggerButton);
  }

  private addTriggerButtonStyles(): void {
    if (!this.triggerButton) return;

    // Create styles that respect the appearance options
    const primaryColor = this.options.appearance?.primaryColor || "#f7931a";
    const borderRadius = this.options.appearance?.borderRadius || "8px";
    const fontFamily =
      this.options.appearance?.fontFamily || "system-ui, sans-serif";

    // Add a style element if it doesn't exist
    if (!document.getElementById("voltage-modal-trigger-styles")) {
      const style = document.createElement("style");
      style.id = "voltage-modal-trigger-styles";
      style.textContent = `
        .voltage-modal-trigger {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: ${primaryColor};
          color: white;
          border: none;
          border-radius: ${borderRadius};
          font-family: ${fontFamily};
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 150ms ease-in-out;
          text-decoration: none;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .voltage-modal-trigger:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .voltage-modal-trigger:active {
          transform: translateY(0);
        }

        .voltage-modal-trigger:focus {
          outline: 2px solid ${primaryColor};
          outline-offset: 2px;
        }

        .voltage-modal-trigger-icon {
          flex-shrink: 0;
        }

        .voltage-modal-trigger-text {
          white-space: nowrap;
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .voltage-modal-trigger {
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
          }

          .voltage-modal-trigger:hover {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
          }
        }

        /* Mobile responsive */
        @media (max-width: 640px) {
          .voltage-modal-trigger {
            padding: 0.625rem 1.25rem;
            font-size: 0.875rem;
          }
        }
      `;
      document.head.appendChild(style);
    }
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

    this.svelteComponent.$on("modalClosed", () => {
      // Modal-specific callback could be added here if needed
      this.options.onModalClose?.();
    });
  }
}
