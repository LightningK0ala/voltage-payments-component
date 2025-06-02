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
npm install @voltage-payments/components
```

### Script Tag (CDN)

```html
<script src="https://unpkg.com/@voltage-payments/components/dist/voltage-payments.umd.js"></script>
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
import { VoltagePayments } from "@voltage-payments/components";

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
  amount: 100000, // Required for Lightning
  // ... other config
});
```

#### On-chain

```javascript
VoltagePayments.create({
  paymentKind: "onchain",
  amount: 500000, // Optional for on-chain
  // ... other config
});
```

#### BIP21 (Unified)

```javascript
VoltagePayments.create({
  paymentKind: "bip21", // Provides both Lightning and on-chain options
  amount: 250000,
  // ... other config
});
```

#### Any Amount

```javascript
VoltagePayments.create({
  amount: null, // Allows user to specify amount
  paymentKind: "bolt11",
  // ... other config
});
```

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

| Option           | Type                             | Required | Description                               |
| ---------------- | -------------------------------- | -------- | ----------------------------------------- |
| `apiKey`         | string                           | ✅       | Your Voltage API key                      |
| `organizationId` | string                           | ✅       | Your Voltage organization ID              |
| `environmentId`  | string                           | ✅       | Your Voltage environment ID               |
| `walletId`       | string                           | ✅       | Target wallet ID for payments             |
| `amount`         | number \| null                   | ❌       | Amount in millisats (null for any amount) |
| `paymentKind`    | 'bolt11' \| 'onchain' \| 'bip21' | ❌       | Payment type (default: 'bip21')           |
| `description`    | string                           | ❌       | Payment description                       |
| `appearance`     | AppearanceConfig                 | ❌       | Visual customization options              |
| `pollingConfig`  | PollingConfig                    | ❌       | Payment status polling configuration      |
| `onReady`        | function                         | ❌       | Called when payment is ready              |
| `onSuccess`      | function                         | ❌       | Called when payment succeeds              |
| `onError`        | function                         | ❌       | Called when payment fails                 |
| `onExpired`      | function                         | ❌       | Called when payment expires               |
| `onStatusChange` | function                         | ❌       | Called when payment status changes        |
| `onQRGenerated`  | function                         | ❌       | Called when QR code is generated          |

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

**Current Status**: ✅ Phase 1 Complete - Real Voltage API Integration

**Next Steps**:

- [ ] QR Code Generation
- [ ] Enhanced Error Handling
- [ ] Modal & Button Variants
