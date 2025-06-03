<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { fade, scale } from "svelte/transition";
  import PaymentInline from "./PaymentInline.svelte";
  import type {
    AppearanceConfig,
    PaymentKind,
    PollingConfig,
  } from "../types/index";

  // Props - same as PaymentInline but with modal-specific additions
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
  export let autoClose: boolean = true;

  // Modal-specific state
  let modalOpen = false;
  let modalElement: HTMLElement;

  const dispatch = createEventDispatcher();

  // Open modal programmatically (called by PaymentModalComponent)
  export function open() {
    modalOpen = true;
    // Focus trap and body scroll lock
    document.body.style.overflow = "hidden";
    setTimeout(() => modalElement?.focus(), 100);
  }

  // Close modal
  export function close() {
    modalOpen = false;
    document.body.style.overflow = "";
    dispatch("modalClosed");
  }

  // Handle escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && modalOpen) {
      close();
    }
  }

  // Handle backdrop click
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      close();
    }
  }

  // Payment event handlers - forward to parent
  function handleReady(event: any) {
    dispatch("ready", event.detail);
  }

  function handleQRGenerated(event: any) {
    dispatch("qrGenerated", event.detail);
  }

  function handleStatusChange(event: any) {
    dispatch("statusChange", event.detail);
  }

  function handleSuccess(event: any) {
    dispatch("success", event.detail);
    if (autoClose) {
      setTimeout(() => close(), 2000); // Auto-close after 2 seconds
    }
  }

  function handleError(event: any) {
    dispatch("error", event.detail);
  }

  function handleExpired(event: any) {
    dispatch("expired", event.detail);
  }

  onMount(() => {
    return () => {
      // Cleanup on unmount
      document.body.style.overflow = "";
    };
  });
</script>

<svelte:window on:keydown={handleKeydown} />

{#if modalOpen}
  <!-- Modal backdrop -->
  <div
    class="voltage-modal-backdrop"
    on:click={handleBackdropClick}
    on:keydown={(e) => e.key === "Escape" && close()}
    transition:fade={{ duration: 200 }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="payment-modal-title"
    tabindex="-1"
  >
    <!-- Modal content -->
    <div
      bind:this={modalElement}
      class="voltage-modal-content"
      transition:scale={{ duration: 200, start: 0.95 }}
      tabindex="-1"
    >
      <!-- Modal header -->
      <div class="voltage-modal-header">
        <h2 id="payment-modal-title" class="voltage-modal-title">
          Complete Payment
        </h2>
        <button
          type="button"
          class="voltage-modal-close"
          on:click={close}
          aria-label="Close payment modal"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Modal body with PaymentInline component -->
      <div class="voltage-modal-body">
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
          on:ready={handleReady}
          on:qrGenerated={handleQRGenerated}
          on:statusChange={handleStatusChange}
          on:success={handleSuccess}
          on:error={handleError}
          on:expired={handleExpired}
        />
      </div>
    </div>
  </div>
{/if}

<style>
  .voltage-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .voltage-modal-content {
    background: white;
    border-radius: 1rem;
    box-shadow:
      0 25px 50px -12px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(0, 0, 0, 0.05);
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    outline: none;
  }

  .voltage-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 1.5rem 0 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 1rem;
  }

  .voltage-modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }

  .voltage-modal-close {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: #6b7280;
    border-radius: 0.375rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 150ms ease-in-out;
  }

  .voltage-modal-close:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .voltage-modal-close:focus {
    outline: 2px solid #f7931a;
    outline-offset: 2px;
  }

  .voltage-modal-body {
    padding: 0 1.5rem 1.5rem 1.5rem;
  }

  /* Dark theme support */
  @media (prefers-color-scheme: dark) {
    .voltage-modal-content {
      background: #1f2937;
      color: #f9fafb;
    }

    .voltage-modal-title {
      color: #f9fafb;
    }

    .voltage-modal-header {
      border-bottom-color: #374151;
    }

    .voltage-modal-close {
      color: #9ca3af;
    }

    .voltage-modal-close:hover {
      background: #374151;
      color: #d1d5db;
    }
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .voltage-modal-backdrop {
      padding: 0.5rem;
    }

    .voltage-modal-content {
      max-width: 100%;
      border-radius: 0.75rem;
    }

    .voltage-modal-header {
      padding: 1rem 1rem 0 1rem;
    }

    .voltage-modal-body {
      padding: 0 1rem 1rem 1rem;
    }

    .voltage-modal-title {
      font-size: 1.125rem;
    }
  }

  /* Animation for better UX */
  .voltage-modal-content {
    animation: modalSlideIn 200ms ease-out;
  }

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translate3d(0, -20px, 0) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
    }
  }

  /* Focus management */
  .voltage-modal-content:focus {
    outline: none;
  }

  /* Scrollbar styling for modal content */
  .voltage-modal-content::-webkit-scrollbar {
    width: 8px;
  }

  .voltage-modal-content::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  .voltage-modal-content::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  .voltage-modal-content::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
</style>
