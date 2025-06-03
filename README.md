# Voltage Payment Component

A lightweight, framework-agnostic Bitcoin payment component library for web applications.

## 🚀 Features

- **Drop-in Integration**: Simple script tag or npm package installation
- **Framework Agnostic**: Works with any web framework (React, Vue, Angular, vanilla JS)
- **Real-time Updates**: Live payment status with configurable polling
- **Voltage API Integration**: Powered by the official Voltage API SDK
- **Multiple Payment Types**: Lightning (Bolt11), On-chain, and BIP21 (unified)
- **Customizable UI**: CSS custom properties for complete theming control
- **TypeScript Support**: Full type definitions included
- **Responsive Design**: Mobile-first responsive layout

## 📦 Installation

### NPM Package

```bash
npm install voltage-payments-component
```

### Script Tag (CDN)

```html
<script src="https://unpkg.com/voltage-payments-component/dist/voltage-payments.umd.js"></script>
```

## 🔑 Voltage API Setup

Before using the component, you'll need:

1. **Voltage Account**: Sign up at [voltage.cloud](https://voltage.cloud)
2. **API Key**: Generate an API key from your Voltage dashboard
3. **Organization ID**: Your organization ID from the dashboard
4. **Environment ID**: Your environment ID (e.g., production, staging)
5. **Wallet ID**: The ID of the wallet you want to receive payments to

## 🎯 Quick Start

### ES Modules (Recommended)

```javascript
import { VoltagePayments } from "voltage-payments-component";

const payment = VoltagePayments.create({
  // Required: Voltage API credentials
  apiKey: "your-voltage-api-key",
  organizationId: "your-org-id",
  environmentId: "your-env-id",
  walletId: "your-wallet-id",

  // Payment configuration
  amount: 100000, // 100k millisats = 100 sats
  paymentKind: "bip21", // 'bolt11', 'onchain', or 'bip21'
  description: "Coffee purchase",

  // Event handlers
  onReady: (payment) => console.log("Payment ready:", payment),
  onSuccess: (payment) => console.log("Payment completed!", payment),
  onError: (error) => console.error("Payment failed:", error),
});

// Mount to DOM element
await payment.mount("#payment-container");
```

### Modal Payment

```javascript
// Create a modal payment that opens when a button is clicked
const modalPayment = VoltagePayments.create({
  apiKey: "your-voltage-api-key",
  organizationId: "your-org-id",
  environmentId: "your-env-id",
  walletId: "your-wallet-id",
  amount: 50000,
  variant: "modal", // Creates a modal dialog
  paymentKind: "bolt11",
  description: "Lightning Payment",
  autoClose: true, // Auto-close modal on successful payment

  // Modal-specific callbacks
  onModalOpen: () => console.log("Modal opened"),
  onModalClose: () => console.log("Modal closed"),
  onSuccess: (payment) => {
    console.log("Payment completed!");
    // Modal will auto-close in 2 seconds
  },
});

// This creates a "Pay with Bitcoin" button that opens the modal
await modalPayment.mount("#modal-button-container");
```

### UMD (Script Tag)

```html
<div id="payment-container"></div>

<script>
  const payment = VoltagePayments.create({
    apiKey: "your-voltage-api-key",
    organizationId: "your-org-id",
    environmentId: "your-env-id",
    walletId: "your-wallet-id",
    amount: 50000,
    paymentKind: "bolt11",
    description: "Lightning payment",
  });

  payment.mount("#payment-container");
</script>
```

## 🎨 Customization

### Appearance Options

```javascript
VoltagePayments.create({
  // ... API config
  appearance: {
    primaryColor: "#f7931a", // Bitcoin orange
    backgroundColor: "#ffffff", // Component background
    borderColor: "#e5e7eb", // Border color
    borderRadius: "12px", // Border radius
    fontFamily: "Inter, sans-serif", // Font family
    textColor: "#1f2937", // Primary text color
    secondaryTextColor: "#6b7280", // Secondary text color
  },
});
```

### Payment Types

#### Lightning (Bolt11)

```javascript
VoltagePayments.create({
  paymentKind: "bolt11",
  amount: 100000, // Required for fixed amount
  // ... other config
});

// Amountless Lightning invoice (payer specifies amount)
VoltagePayments.create({
  paymentKind: "bolt11",
  amount: null, // Omit amount entirely for amountless invoices
  // ... other config
});
```

#### On-chain

```javascript
VoltagePayments.create({
  paymentKind: "onchain",
  amount: 54600000, // Must be >= 1 msat (546 sats = dust limit recommended)
  // ... other config
});
```

#### BIP21 (Unified)

```javascript
VoltagePayments.create({
  paymentKind: "bip21", // Provides both Lightning and on-chain options
  amount: 250000, // Must be >= 1 msat for on-chain compatibility
  // ... other config
});
```

### Payment Variants

#### Inline Payment (Default)

```javascript
VoltagePayments.create({
  variant: "inline", // Default - embeds directly in your page
  // ... other config
});
```

#### Modal Payment

```javascript
VoltagePayments.create({
  variant: "modal", // Creates a modal dialog triggered by a button
  autoClose: true, // Auto-close modal on success (default: true)
  description: "Custom button text", // Used as button text
  appearance: {
    primaryColor: "#8b5cf6", // Customizes button and modal styling
  },
  onModalOpen: () => console.log("Modal opened"),
  onModalClose: () => console.log("Modal closed"),
  // ... other config
});
```

**⚠️ Amount Requirements:**

- **Lightning (bolt11)**: Use `amount: null` for amountless invoices (payer specifies amount), or specify `amount > 0` for fixed amounts
- **On-chain**: Must use `amount >= 1` (recommend 546 sats = 54,600,000 msats as dust limit)
- **BIP21**: Must use `amount >= 1` for on-chain compatibility

## 📡 Event Handling

```javascript
VoltagePayments.create({
  // ... config
  onReady: (payment) => {
    // Payment request generated and ready for payment
    console.log("Payment ID:", payment.id);
    console.log("Payment Request:", payment.paymentRequest);
  },

  onQRGenerated: (qrData, paymentRequest, address) => {
    // QR code data is ready
    console.log("Scan this:", qrData);
  },

  onStatusChange: (status, payment) => {
    // Payment status updated
    console.log("New status:", status);
  },

  onSuccess: (payment) => {
    // Payment completed successfully
    showSuccessMessage("Payment received!");
    redirectToThankYouPage();
  },

  onError: (error) => {
    // Payment failed or error occurred
    console.error("Error:", error.message);
    showErrorMessage(error.message);
  },

  onExpired: (payment) => {
    // Payment request expired
    console.log("Payment expired, creating new one...");
  },
});
```

## ⚙️ Configuration Options

### Polling Configuration

```javascript
VoltagePayments.create({
  // ... other config
  pollingConfig: {
    maxAttempts: 100, // Maximum polling attempts
    intervalMs: 5000, // Poll every 5 seconds
    timeoutMs: 300000, // 5 minute timeout
  },
});
```

### UI Options

```javascript
VoltagePayments.create({
  // ... other config
  showQRCode: true, // Show/hide QR code (default: true)
  showCopyButton: true, // Show/hide copy button (default: true)
  theme: "auto", // 'light', 'dark', or 'auto'
});
```

## 🛠️ Development

### Local Development

```bash
git clone https://github.com/voltage/voltage-payment-component
cd voltage-payment-component
npm install
npm run dev
```

Visit `http://localhost:5175` to see the interactive demo.

### Using Real API Credentials in Development

To test with real Voltage API credentials instead of mock data:

1. **Copy the environment template:**

   ```bash
   cp .env.example .env
   ```

2. **Fill in your real Voltage API credentials in `.env`:**

   ```bash
   # Your actual Voltage API credentials
   VITE_VOLTAGE_API_KEY=vltg_your_actual_api_key_here
   VITE_VOLTAGE_ORGANIZATION_ID=your_actual_org_id
   VITE_VOLTAGE_ENVIRONMENT_ID=your_actual_env_id
   VITE_VOLTAGE_WALLET_ID=your_actual_wallet_id
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The demo will automatically detect and use your real API credentials, allowing you to:

- ✅ Create real payment requests
- ✅ Generate actual Lightning invoices and Bitcoin addresses
- ✅ Test real payment status polling
- ✅ Receive actual Bitcoin payments (be careful!)

**⚠️ Security Note**: The `.env` file is ignored by git and should never be committed. Only use testnet/regtest credentials for development.

### Building

```bash
npm run build        # Build library
npm run type-check   # Type checking
npm run test         # Run tests
```

## 📖 API Reference

### VoltagePayments.create(options)

Creates a new payment component instance.

#### Options

| Option           | Type                             | Required | Description                                |
| ---------------- | -------------------------------- | -------- | ------------------------------------------ |
| `apiKey`         | string                           | ✅       | Your Voltage API key                       |
| `organizationId` | string                           | ✅       | Your Voltage organization ID               |
| `environmentId`  | string                           | ✅       | Your Voltage environment ID                |
| `walletId`       | string                           | ✅       | Target wallet ID for payments              |
| `amount`         | number                           | ❌       | Amount in millisats (use 0 for any amount) |
| `paymentKind`    | 'bolt11' \| 'onchain' \| 'bip21' | ❌       | Payment type (default: 'bip21')            |
| `variant`        | 'inline' \| 'modal' \| 'button'  | ❌       | Payment variant (default: 'inline')        |
| `description`    | string                           | ❌       | Payment description                        |
| `autoClose`      | boolean                          | ❌       | Auto-close modal on success (modal only)   |
| `appearance`     | AppearanceConfig                 | ❌       | Visual customization options               |
| `pollingConfig`  | PollingConfig                    | ❌       | Payment status polling configuration       |
| `onReady`        | function                         | ❌       | Called when payment is ready               |
| `onSuccess`      | function                         | ❌       | Called when payment succeeds               |
| `onError`        | function                         | ❌       | Called when payment fails                  |
| `onExpired`      | function                         | ❌       | Called when payment expires                |
| `onStatusChange` | function                         | ❌       | Called when payment status changes         |
| `onQRGenerated`  | function                         | ❌       | Called when QR code is generated           |
| `onModalOpen`    | function                         | ❌       | Called when modal opens (modal only)       |
| `onModalClose`   | function                         | ❌       | Called when modal closes (modal only)      |

### Payment Component Methods

```javascript
const payment = VoltagePayments.create({...});

await payment.mount('#container');     // Mount to DOM element
payment.unmount();                     // Unmount from DOM
payment.destroy();                     // Clean up and destroy
payment.updateOptions({...});          // Update configuration
payment.getStatus();                   // Get current status
payment.getPaymentData();              // Get payment data
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [voltage.cloud/docs](https://voltage.cloud/docs)
- **API Reference**: [voltage.cloud/api](https://voltage.cloud/api)
- **Issues**: [GitHub Issues](https://github.com/voltage/voltage-payment-component/issues)
- **Discord**: [Voltage Community](https://discord.gg/voltage)

---

**Current Status**: ✅ Phase 2 Complete - Modal Payment Variant

**Completed Features**:

- ✅ Inline Payment Component
- ✅ Modal Payment Component
- ✅ Real Voltage API Integration
- ✅ QR Code Generation
- ✅ Multiple Payment Types (Lightning, On-chain, BIP21)
- ✅ Custom Styling & Theming
- ✅ TypeScript Support

**Next Steps**:

- [ ] Button Payment Variant (Phase 3)
- [ ] Enhanced Error Handling
- [ ] Framework Wrappers (React, Vue, Angular)
