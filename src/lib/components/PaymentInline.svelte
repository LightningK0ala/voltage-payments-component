<script lang="ts">
  import { onMount, createEventDispatcher, onDestroy } from "svelte";
  import { VoltageClient } from "voltage-api-sdk";
  import QRCode from "qrcode";
  import type {
    PaymentKind,
    PaymentStatus,
    AppearanceConfig,
    PollingConfig,
  } from "../types/index";

  // Props
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

  // Internal state
  let status: PaymentStatus = "generating";
  let paymentRequest: string = "";
  let address: string = "";
  let paymentId: string = "";
  let error: string | null = null;
  let isLoading: boolean = true;
  let qrCodeDataUrl: string = "";
  let expiresAt: Date | null = null;
  let timeRemaining: number = 0;
  let countdownInterval: ReturnType<typeof setInterval> | null = null;
  let showSuccessAnimation: boolean = false;
  let transactionId: string | null = null;
  let copySuccess: boolean = false;
  let copyTimeout: ReturnType<typeof setTimeout> | null = null;

  // Create Voltage client instance
  let voltageClient: VoltageClient;

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Generate CSS custom properties from appearance config
  $: cssVars = {
    "--vp-primary": appearance.primaryColor || "#f7931a",
    "--vp-bg": appearance.backgroundColor || "#ffffff",
    "--vp-border": appearance.borderColor || "#e5e7eb",
    "--vp-radius": appearance.borderRadius || "8px",
    "--vp-font": appearance.fontFamily || "system-ui, sans-serif",
    "--vp-text": appearance.textColor || "#1f2937",
    "--vp-text-secondary": appearance.secondaryTextColor || "#6b7280",
  };

  // Enhanced status messages with icons
  $: statusDisplay = getStatusDisplay(status, timeRemaining);

  function getStatusDisplay(currentStatus: PaymentStatus, remaining: number) {
    switch (currentStatus) {
      case "generating":
        return {
          icon: "⏳",
          text: "Generating payment request...",
          color: "#f59e0b",
        };
      case "ready":
        if (paymentKind === "bolt11" && remaining > 0) {
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
          return {
            icon: "spinner",
            text: `Awaiting payment (${minutes}:${seconds.toString().padStart(2, "0")})`,
            color: "#3b82f6",
          };
        }
        return { icon: "spinner", text: "Awaiting payment", color: "#3b82f6" };
      case "processing":
        return {
          icon: "spinner",
          text: "Processing payment...",
          color: "#8b5cf6",
        };
      case "completed":
        return { icon: "✅", text: "Payment received!", color: "#10b981" };
      case "failed":
        return { icon: "❌", text: "Payment failed", color: "#ef4444" };
      case "expired":
        return { icon: "⏰", text: "Payment expired", color: "#f59e0b" };
      default:
        return { icon: "spinner", text: "Pending", color: "#6b7280" };
    }
  }

  onMount(async () => {
    try {
      // Initialize Voltage client with custom baseUrl if provided, otherwise use default logic
      let clientBaseUrl: string;

      if (baseUrl) {
        // Use the explicitly provided baseUrl
        clientBaseUrl = baseUrl;
      } else {
        // Fall back to original logic: proxy in dev, env var or default in production
        const isDev = import.meta.env.DEV;
        clientBaseUrl = isDev
          ? "/api/voltage" // Use proxy in development
          : import.meta.env.VITE_VOLTAGE_BASE_URL ||
            "https://voltageapi.com/v1";
      }

      voltageClient = new VoltageClient({
        apiKey: apiKey,
        baseUrl: clientBaseUrl,
        timeout: 30000,
      });

      await createPaymentRequest();
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown error";
      status = "failed";
      dispatch("error", { message: error, code: "PAYMENT_CREATION_FAILED" });
    }
  });

  onDestroy(() => {
    // Clean up countdown timer
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    // Clean up copy timeout
    if (copyTimeout) {
      clearTimeout(copyTimeout);
    }
  });

  async function createPaymentRequest() {
    try {
      // Validate required parameters
      if (!organizationId || !environmentId) {
        throw new Error(
          "organizationId and environmentId are required for real API calls"
        );
      }

      // Generate unique payment ID
      paymentId = crypto.randomUUID();

      // Build payment object - for bolt11 amountless invoices, omit amount_msats entirely
      const paymentObj: any = {
        id: paymentId,
        wallet_id: walletId,
        currency: "btc",
        payment_kind: paymentKind,
        description: description || "Voltage Payment Component",
      };

      // Only include amount_msats if:
      // 1. It's not a bolt11 payment, OR
      // 2. It's a bolt11 payment with a specified amount (amount > 0)
      if (
        paymentKind !== "bolt11" ||
        (paymentKind === "bolt11" && amount !== null && amount > 0)
      ) {
        paymentObj.amount_msats = amount;
      }

      // Create payment request using Voltage API
      const payment = await voltageClient.createPaymentRequest(
        {
          organization_id: organizationId!,
          environment_id: environmentId!,
          payment: paymentObj,
        },
        {
          maxAttempts: pollingConfig.maxAttempts || 30,
          intervalMs: pollingConfig.intervalMs || 1000,
          timeoutMs: pollingConfig.timeoutMs || 30000,
        }
      );

      // Extract payment details based on payment type
      if (payment.type === "bolt11") {
        paymentRequest = payment.data.payment_request || "";
        // Set expiration for Lightning payments (typically 10 minutes)
        expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      } else if (payment.type === "onchain") {
        address = payment.data.address || "";
      } else if (payment.type === "bip21") {
        paymentRequest = payment.data.payment_request || "";
        address = payment.data.address || "";
      }

      status = "ready";
      isLoading = false;

      // Dispatch events
      dispatch("ready", {
        id: payment.id,
        status: payment.status,
        paymentRequest,
        address,
        amount,
        description,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
      });

      if (showQRCode && (paymentRequest || address)) {
        const qrData =
          paymentKind === "bip21" && paymentRequest && address
            ? paymentRequest // For BIP21, prefer the payment request which includes the address
            : paymentRequest || address;

        // Generate QR code
        await generateQRCode(qrData);

        dispatch("qrGenerated", {
          qrData,
          paymentRequest,
          address,
        });
      }

      // Start polling for payment status if needed
      if (payment.status === "receiving" || payment.status === "generating") {
        startPaymentStatusPolling();
      }

      // Start countdown timer
      startCountdownTimer();
    } catch (err) {
      console.error("Payment creation failed:", err);
      error =
        err instanceof Error ? err.message : "Failed to create payment request";
      status = "failed";
      isLoading = false;

      dispatch("error", {
        message: error,
        code: "PAYMENT_CREATION_FAILED",
        details: err,
      });
    }
  }

  async function generateQRCode(data: string) {
    try {
      // Determine colors based on theme and appearance
      const isDarkMode =
        theme === "dark" ||
        (theme === "auto" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      const darkColor =
        appearance.textColor || (isDarkMode ? "#ffffff" : "#1f2937");
      const lightColor =
        appearance.backgroundColor || (isDarkMode ? "#1f2937" : "#ffffff");

      // Convert to uppercase for more efficient QR encoding (saves space)
      const upperCaseData = data.toUpperCase();

      qrCodeDataUrl = await QRCode.toDataURL(upperCaseData, {
        width: 256,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        errorCorrectionLevel: "M",
      });
    } catch (err) {
      console.error("QR code generation failed:", err);
      qrCodeDataUrl = "";

      // Dispatch error event for QR generation failure
      dispatch("error", {
        message: "Failed to generate QR code",
        code: "QR_GENERATION_FAILED",
        details: err,
      });
    }
  }

  async function startPaymentStatusPolling() {
    if (!organizationId || !environmentId || !paymentId) return;

    const maxAttempts = pollingConfig.maxAttempts || 100;
    const intervalMs = pollingConfig.intervalMs || 5000; // Poll every 5 seconds
    let attempts = 0;

    const pollPayment = async () => {
      try {
        const payment = await voltageClient.getPayment({
          organization_id: organizationId!,
          environment_id: environmentId!,
          payment_id: paymentId,
        });

        const newStatus = mapVoltageStatusToComponentStatus(payment.status);

        if (newStatus !== status) {
          status = newStatus;

          // Handle completed payment with animation and transaction ID
          if (newStatus === "completed") {
            triggerSuccessAnimation();
            transactionId = payment.id || null; // Use payment ID as transaction reference

            // Clear countdown timer on success
            if (countdownInterval) {
              clearInterval(countdownInterval);
              countdownInterval = null;
            }

            dispatch("success", {
              id: payment.id,
              status: payment.status,
              paymentRequest,
              address,
              amount,
              description,
              transactionId,
              createdAt: payment.created_at,
              updatedAt: payment.updated_at,
            });
            return; // Stop polling
          }

          // Handle other status changes
          dispatch("statusChange", {
            status: newStatus,
            payment: {
              id: payment.id,
              status: payment.status,
              paymentRequest,
              address,
              amount,
              description,
              createdAt: payment.created_at,
              updatedAt: payment.updated_at,
            },
          });

          // Handle failed payment
          if (newStatus === "failed") {
            dispatch("error", {
              message: "Payment failed",
              code: "PAYMENT_FAILED",
              details: payment,
            });
            return; // Stop polling
          }

          // Handle expired payment
          if (newStatus === "expired") {
            dispatch("expired", {
              id: payment.id,
              status: payment.status,
              paymentRequest,
              address,
              amount,
              description,
              createdAt: payment.created_at,
              updatedAt: payment.updated_at,
            });
            return; // Stop polling
          }
        }

        // Continue polling if not finished and haven't exceeded max attempts
        attempts++;
        if (
          attempts < maxAttempts &&
          (newStatus === "ready" || newStatus === "processing")
        ) {
          setTimeout(pollPayment, intervalMs);
        }
      } catch (err) {
        console.error("Payment status polling error:", err);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(pollPayment, intervalMs);
        }
      }
    };

    // Start polling after a short delay
    setTimeout(pollPayment, intervalMs);
  }

  function mapVoltageStatusToComponentStatus(
    voltageStatus: string
  ): PaymentStatus {
    switch (voltageStatus) {
      case "generating":
        return "generating";
      case "receiving":
        return "ready";
      case "completed":
        return "completed";
      case "failed":
        return "failed";
      case "expired":
        return "expired";
      default:
        return "ready";
    }
  }

  async function copyToClipboard() {
    const textToCopy = paymentRequest || address;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);

      // Show success feedback
      copySuccess = true;

      // Clear any existing timeout
      if (copyTimeout) {
        clearTimeout(copyTimeout);
      }

      // Reset after 2 seconds
      copyTimeout = setTimeout(() => {
        copySuccess = false;
        copyTimeout = null;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      // TODO: Fallback for older browsers
    }
  }

  // Display the appropriate payment string
  $: displayPaymentString = paymentRequest || address;
  $: displayLabel = paymentRequest ? "Payment Request:" : "Bitcoin Address:";

  function startCountdownTimer() {
    if (paymentKind !== "bolt11" || !expiresAt) return;

    countdownInterval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = expiresAt!.getTime();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));

      timeRemaining = remaining;

      if (remaining <= 0) {
        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
        if (status === "ready") {
          status = "expired";
          dispatch("expired", {
            id: paymentId,
            status: "expired",
            paymentRequest,
            address,
            amount,
            description,
          });
        }
      }
    }, 1000);
  }

  function triggerSuccessAnimation() {
    showSuccessAnimation = true;
    setTimeout(() => {
      showSuccessAnimation = false;
    }, 3000); // Show animation for 3 seconds
  }
</script>

<div
  class="voltage-payment inline"
  style={Object.entries(cssVars)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ")}
>
  <!-- Success Animation Overlay -->
  {#if showSuccessAnimation}
    <div class="success-animation">
      <div class="success-checkmark">✅</div>
      <div class="success-text">Payment Received!</div>
    </div>
  {/if}

  <div class="payment-header">
    <h3 class="payment-title">Complete Payment</h3>
    <div
      class="status-indicator status-{status}"
      style="color: {statusDisplay.color};"
    >
      {#if statusDisplay.icon === "spinner"}
        <div class="status-spinner"></div>
      {:else}
        <span class="status-icon">{statusDisplay.icon}</span>
      {/if}
      <span class="status-text">{statusDisplay.text}</span>
    </div>
  </div>

  {#if isLoading}
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Generating payment...</p>
    </div>
  {:else if error}
    <div class="error-message" role="alert">
      {error}
    </div>
  {:else if displayPaymentString}
    <div class="payment-content">
      {#if showQRCode}
        <div class="qr-container">
          {#if qrCodeDataUrl}
            <img src={qrCodeDataUrl} alt="Payment QR Code" class="qr-code" />
          {:else}
            <div class="qr-placeholder">
              <div class="qr-loading">Generating QR Code...</div>
            </div>
          {/if}
        </div>
      {/if}

      <div class="payment-details">
        <!-- Payment Type and Amount Section -->
        <div class="payment-info-section">
          <div class="payment-type">
            {#if paymentKind === "bolt11"}
              ⚡ Lightning
              <span
                class="info-tooltip"
                title="Fast, low-fee payments. Best for small amounts.">ℹ️</span
              >
            {:else if paymentKind === "onchain"}
              🔗 On-chain
              <span
                class="info-tooltip"
                title="Secure Bitcoin base layer. Best for large amounts."
                >ℹ️</span
              >
            {:else if paymentKind === "bip21"}
              💎 Universal
              <span
                class="info-tooltip"
                title="Supports both Lightning and on-chain payments.">ℹ️</span
              >
            {/if}
          </div>

          {#if amount && amount > 0}
            <div class="amount-display">
              <strong>{(amount / 100000000).toFixed(8)} BTC</strong>
              <span class="amount-msats">({amount.toLocaleString()} msats)</span
              >
            </div>
          {:else}
            <div class="amount-display">
              <strong>Any amount</strong>
              <span class="amount-note">Payer specifies amount</span>
            </div>
          {/if}
        </div>

        <!-- Payment Request Section -->
        <div class="payment-request-section">
          <div class="payment-request">
            <label for="payment-request-input">{displayLabel}</label>
            <div class="input-copy-container">
              <input
                id="payment-request-input"
                type="text"
                readonly
                value={displayPaymentString}
                class="payment-request-input"
              />
              {#if showCopyButton}
                <button
                  type="button"
                  on:click={copyToClipboard}
                  class="copy-button"
                  class:copy-success={copySuccess}
                  aria-label="Copy payment request"
                >
                  {copySuccess ? "Copied!" : "Copy"}
                </button>
              {/if}
            </div>
          </div>

          {#if paymentKind === "bip21" && paymentRequest && address}
            <div class="bip21-details">
              <div class="payment-option">
                <strong>⚡ Lightning:</strong>
                <span class="option-preview"
                  >{paymentRequest.slice(0, 30)}...</span
                >
              </div>
              <div class="payment-option">
                <strong>🔗 On-chain:</strong>
                <span class="option-preview">{address}</span>
              </div>
            </div>
          {/if}
        </div>

        <!-- Transaction ID Section (shown after successful payment) -->
        {#if transactionId && status === "completed"}
          <div class="transaction-section">
            {#if paymentKind === "onchain"}
              <div class="transaction-id">
                <strong>Transaction ID:</strong>
                <a
                  href="https://mempool.space/tx/{transactionId}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="transaction-link"
                >
                  View on mempool.space
                </a>
              </div>
            {:else if paymentKind === "bip21"}
              <div class="transaction-id">
                <strong>Payment Completed:</strong>
                <span class="payment-id">
                  {description || "Universal payment received"}
                </span>
              </div>
            {:else}
              <div class="transaction-id">
                <strong>Lightning Payment:</strong>
                <span class="payment-id">Payment successfully received</span>
              </div>
            {/if}
          </div>
        {/if}

        {#if description}
          <div class="description">
            {description}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .voltage-payment {
    border: 1px solid var(--vp-border);
    border-radius: var(--vp-radius);
    padding: 1.5rem;
    background: var(--vp-bg);
    font-family: var(--vp-font);
    color: var(--vp-text);
    max-width: 400px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
  }

  /* Success Animation */
  .success-animation {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(16, 185, 129, 0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    animation: slideIn 0.3s ease-out;
  }

  .success-checkmark {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    animation: bounce 1s ease-in-out;
  }

  .success-text {
    color: white;
    font-size: 1.25rem;
    font-weight: 600;
  }

  @keyframes slideIn {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes bounce {
    0%,
    20%,
    60%,
    100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    80% {
      transform: translateY(-5px);
    }
  }

  .payment-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--vp-border);
    gap: 0.75rem;
    text-align: center;
  }

  .payment-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .status-indicator {
    padding: 0.5rem 1rem;
    border-radius: calc(var(--vp-radius) * 0.75);
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    max-width: 100%;
  }

  .status-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #e5e7eb;
    border-top: 2px solid var(--vp-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .status-icon {
    /* Icon spacing handled by gap in parent */
  }

  .status-text {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .loading-container {
    text-align: center;
    padding: 2rem;
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e5e7eb;
    border-top: 3px solid var(--vp-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .payment-content {
    text-align: center;
  }

  .qr-container {
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: center;
  }

  .qr-code {
    width: 200px;
    height: 200px;
    border-radius: calc(var(--vp-radius) * 1.5);
    border: 1px solid var(--vp-border);
    padding: 0.75rem;
    background: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    object-fit: contain;
  }

  .qr-placeholder {
    width: 200px;
    height: 200px;
    border: 2px dashed var(--vp-border);
    border-radius: calc(var(--vp-radius) * 1.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    color: var(--vp-text-secondary);
    background: var(--vp-bg);
  }

  .qr-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .qr-loading::before {
    content: "⏳";
    font-size: 1.5rem;
    animation: pulse 2s infinite;
  }

  .payment-details {
    margin-top: 1rem;
    text-align: left;
  }

  .payment-info-section {
    margin-bottom: 1rem;
    padding: 1rem;
    background: rgba(249, 250, 251, 0.5);
    border-radius: calc(var(--vp-radius) * 0.75);
    border: 1px solid var(--vp-border);
  }

  .payment-type {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--vp-text);
  }

  .info-tooltip {
    cursor: help;
    font-size: 0.75rem;
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .info-tooltip:hover {
    opacity: 1;
  }

  .amount-display {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .amount-display strong {
    font-size: 1.125rem;
    color: var(--vp-text);
  }

  .amount-msats,
  .amount-note {
    font-size: 0.75rem;
    color: var(--vp-text-secondary);
  }

  .payment-request-section {
    margin-bottom: 1rem;
  }

  .payment-request {
    margin-bottom: 0.75rem;
  }

  .payment-request label {
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    display: block;
    color: var(--vp-text-secondary);
  }

  .input-copy-container {
    display: flex;
    gap: 0.5rem;
    align-items: stretch;
  }

  .payment-request-input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid var(--vp-border);
    border-radius: calc(var(--vp-radius) * 0.5);
    font-family: monospace;
    font-size: 0.75rem;
    background: var(--vp-bg);
    color: var(--vp-text);
    transition: border-color 0.2s;
  }

  .payment-request-input:focus {
    outline: none;
    border-color: var(--vp-primary);
  }

  .copy-button {
    padding: 0.75rem 1rem;
    background: var(--vp-primary);
    color: white;
    border: none;
    border-radius: calc(var(--vp-radius) * 0.5);
    cursor: pointer;
    font-weight: 500;
    font-size: 0.875rem;
    transition: all 0.2s;
    min-width: 80px;
  }

  .copy-button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .copy-button.copy-success {
    background: #10b981;
    transform: scale(1.02);
  }

  .copy-button.copy-success:hover {
    background: #059669;
    transform: scale(1.02);
  }

  .bip21-details {
    padding: 0.75rem;
    background: rgba(59, 130, 246, 0.05);
    border-radius: calc(var(--vp-radius) * 0.5);
    border: 1px solid rgba(59, 130, 246, 0.1);
  }

  .payment-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    gap: 0.5rem;
    min-width: 0;
  }

  .payment-option:last-child {
    margin-bottom: 0;
  }

  .payment-option strong {
    flex-shrink: 0;
    white-space: nowrap;
  }

  .option-preview {
    font-family: monospace;
    font-size: 0.75rem;
    color: var(--vp-text-secondary);
    opacity: 0.8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    flex: 1;
    text-align: right;
  }

  .transaction-section {
    margin-top: 1rem;
    padding: 0.75rem;
    background: rgba(16, 185, 129, 0.05);
    border-radius: calc(var(--vp-radius) * 0.5);
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  .transaction-id {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .transaction-link {
    color: var(--vp-primary);
    text-decoration: none;
    font-family: monospace;
    font-size: 0.75rem;
    transition: color 0.2s;
  }

  .transaction-link:hover {
    text-decoration: underline;
  }

  .payment-id {
    color: var(--vp-text-secondary);
    font-family: monospace;
    font-size: 0.75rem;
  }

  .description {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background: rgba(107, 114, 128, 0.05);
    border-radius: calc(var(--vp-radius) * 0.5);
    color: var(--vp-text-secondary);
    font-size: 0.875rem;
    border: 1px solid rgba(107, 114, 128, 0.1);
  }

  .error-message {
    padding: 1rem;
    background: #fee2e2;
    border: 1px solid #fecaca;
    border-radius: var(--vp-radius);
    color: #dc2626;
    text-align: center;
  }

  /* Responsive design */
  @media (max-width: 480px) {
    .voltage-payment {
      padding: 1rem;
    }

    .payment-title {
      font-size: 1.125rem;
    }

    .status-indicator {
      font-size: 0.875rem;
      padding: 0.5rem 0.875rem;
    }

    .input-copy-container {
      flex-direction: column;
      gap: 0.5rem;
    }

    .copy-button {
      align-self: stretch;
    }

    .qr-placeholder,
    .qr-code {
      width: 150px;
      height: 150px;
      padding: 0.5rem;
    }

    .payment-option {
      flex-direction: column;
      align-items: stretch;
      gap: 0.25rem;
      text-align: left;
    }

    .option-preview {
      text-align: left;
      font-size: 0.7rem;
    }

    .transaction-id {
      flex-direction: column;
      align-items: stretch;
      gap: 0.25rem;
    }
  }

  @media (max-width: 380px) {
    .payment-title {
      font-size: 1rem;
    }

    .status-indicator {
      font-size: 0.8rem;
      padding: 0.4rem 0.7rem;
    }

    .status-text {
      font-size: 0.8rem;
    }

    .payment-option strong {
      font-size: 0.8rem;
    }

    .option-preview {
      font-size: 0.65rem;
    }
  }
</style>
