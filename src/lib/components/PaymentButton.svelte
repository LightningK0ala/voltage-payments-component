<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";
  import PaymentInline from "./PaymentInline.svelte";
  import type {
    AppearanceConfig,
    PaymentKind,
    PollingConfig,
  } from "../types/index";

  // Props - same as PaymentInline but with button-specific additions
  export let apiKey: string;
  export let walletId: string;
  export let amount: number | null = null;
  export let paymentKind: PaymentKind = "bip21";
  export let description: string = "";
  export let appearance: AppearanceConfig = {};
  export let theme: "light" | "dark" | "auto" = "auto";
  export let showQRCode: boolean = true;
  export let showCopyButton: boolean = true;
  export let pollingConfig: PollingConfig = {};
  export let organizationId: string | undefined = undefined;
  export let environmentId: string | undefined = undefined;
  export let baseUrl: string | undefined = undefined;
  // Taproot Asset props
  export let assetCurrency: string | undefined = undefined;
  export let assetAmount: number | undefined = undefined;
  export let assetLabel: string | undefined = undefined;

  // Button-specific state
  let paymentVisible = false;
  let isProcessing = false;

  const dispatch = createEventDispatcher();

  // Toggle payment visibility
  function togglePayment() {
    if (!isProcessing) {
      paymentVisible = !paymentVisible;
      if (paymentVisible) {
        dispatch("buttonActivated");
      } else {
        dispatch("buttonDeactivated");
      }
    }
  }

  // Payment event handlers - forward to parent
  function handleReady(event: any) {
    isProcessing = true;
    dispatch("ready", event.detail);
  }

  function handleQRGenerated(event: any) {
    dispatch("qrGenerated", event.detail);
  }

  function handleStatusChange(event: any) {
    dispatch("statusChange", event.detail);
  }

  function handleSuccess(event: any) {
    isProcessing = false;
    dispatch("success", event.detail);
    // Auto-collapse after success
    setTimeout(() => {
      paymentVisible = false;
    }, 3000);
  }

  function handleError(event: any) {
    isProcessing = false;
    dispatch("error", event.detail);
  }

  function handleExpired(event: any) {
    isProcessing = false;
    dispatch("expired", event.detail);
  }

  // Get computed styles for the button based on appearance config
  $: buttonStyles = getButtonStyles(appearance);

  function getButtonStyles(appearance: AppearanceConfig) {
    const primaryColor = appearance.primaryColor || "#f7931a";
    const borderRadius = appearance.borderRadius || "8px";
    const fontFamily = appearance.fontFamily || "system-ui, sans-serif";

    return {
      backgroundColor: primaryColor,
      borderRadius,
      fontFamily,
    };
  }
</script>

<div class="voltage-button-payment">
  <!-- Payment Button -->
  <button
    type="button"
    class="voltage-payment-button"
    class:active={paymentVisible}
    class:processing={isProcessing}
    on:click={togglePayment}
    style="background-color: {buttonStyles.backgroundColor}; border-radius: {buttonStyles.borderRadius}; font-family: {buttonStyles.fontFamily};"
    disabled={isProcessing}
  >
    <svg
      class="voltage-payment-button-icon"
      class:spin={isProcessing}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      {#if isProcessing}
        <path
          d="M12 2v4m6.364.636l-2.828 2.828M20 12h-4m-2.364 6.364l-2.828-2.828M12 20v-4m-6.364-2.364l2.828-2.828M4 12h4m2.364-6.364l2.828 2.828"
        />
      {:else if paymentVisible}
        <path d="M6 18L18 6M6 6l12 12" />
      {:else}
        <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7z" />
        <path d="M9 12l2 2 4-4" />
      {/if}
    </svg>

    <span class="voltage-payment-button-text">
      {#if isProcessing}
        Processing...
      {:else if paymentVisible}
        Cancel Payment
      {:else}
        {description || "Pay with Bitcoin"}
      {/if}
    </span>
  </button>

  <!-- Payment Interface (slides down when button is clicked) -->
  {#if paymentVisible}
    <div class="voltage-payment-interface" transition:slide={{ duration: 300 }}>
      <PaymentInline
        {apiKey}
        {walletId}
        {amount}
        {paymentKind}
        {description}
        {appearance}
        {theme}
        {showQRCode}
        {showCopyButton}
        {pollingConfig}
        {organizationId}
        {environmentId}
        {baseUrl}
        {assetCurrency}
        {assetAmount}
        {assetLabel}
        on:ready={handleReady}
        on:qrGenerated={handleQRGenerated}
        on:statusChange={handleStatusChange}
        on:success={handleSuccess}
        on:error={handleError}
        on:expired={handleExpired}
      />
    </div>
  {/if}
</div>

<style>
  .voltage-button-payment {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 400px;
  }

  .voltage-payment-button {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1.5rem;
    background: #f7931a;
    color: white;
    border: none;
    border-radius: 8px;
    font-family: system-ui, sans-serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 200ms ease-in-out;
    text-decoration: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
  }

  .voltage-payment-button:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .voltage-payment-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .voltage-payment-button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .voltage-payment-button.active {
    background: #6b7280;
  }

  .voltage-payment-button.processing {
    background: #059669;
  }

  .voltage-payment-button:focus {
    outline: 2px solid #f7931a;
    outline-offset: 2px;
  }

  .voltage-payment-button-icon {
    flex-shrink: 0;
    transition: transform 200ms ease-in-out;
  }

  .voltage-payment-button-icon.spin {
    animation: spin 1s linear infinite;
  }

  .voltage-payment-button-text {
    white-space: nowrap;
    font-weight: 600;
  }

  .voltage-payment-interface {
    border-top: 1px solid #e5e7eb;
    padding-top: 1rem;
  }

  /* Pulse effect for processing state */
  .voltage-payment-button.processing::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    animation: shimmer 2s infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  /* Dark theme support */
  @media (prefers-color-scheme: dark) {
    .voltage-payment-button {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .voltage-payment-button:hover:not(:disabled) {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
    }

    .voltage-payment-interface {
      border-top-color: #374151;
    }
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .voltage-button-payment {
      max-width: 100%;
    }

    .voltage-payment-button {
      padding: 0.75rem 1.25rem;
      font-size: 0.875rem;
      gap: 0.5rem;
    }

    .voltage-payment-button-icon {
      width: 18px;
      height: 18px;
    }
  }

  /* Accessibility improvements */
  @media (prefers-reduced-motion: reduce) {
    .voltage-payment-button,
    .voltage-payment-button-icon {
      transition: none;
    }

    .voltage-payment-button-icon.spin {
      animation: none;
    }

    .voltage-payment-button.processing::before {
      animation: none;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .voltage-payment-button {
      border: 2px solid currentColor;
    }

    .voltage-payment-interface {
      border-top-width: 2px;
    }
  }
</style>
