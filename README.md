# Voltage Payment Component

> ⚡ Lightweight, framework-agnostic Bitcoin payment components for web applications

A drop-in payment component library that simplifies Bitcoin Lightning and on-chain payments, built on top of the [Voltage API SDK](https://github.com/LightningK0ala/voltage-api-sdk).

## 🚀 Quick Start

### CDN Usage (Coming Soon)
```html
<script src="https://cdn.voltage.com/components/v1/voltage-payments.js"></script>
<div id="payment-container"></div>
<script>
  VoltagePayments.create({
    apiKey: 'vltg_your_api_key',
    walletId: 'your_wallet_id',
    amount: 150000, // 150 sats
    description: 'Coffee purchase'
  }).mount('#payment-container');
</script>
```

### NPM Usage (Coming Soon)
```bash
npm install @voltage-payments/components
```

```javascript
import { VoltagePayments } from '@voltage-payments/components';

const payment = VoltagePayments.create({
  apiKey: 'vltg_your_api_key',
  walletId: 'your_wallet_id',
  amount: 150000,
  description: 'Coffee purchase'
});

payment.mount('#payment-container');
```

## 🛠 Development Setup

This project is currently in development. To run the development environment:

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd voltage-payment-component

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code

## 📋 Current Status

### ✅ Completed (Phase 1 - MVP)
- [x] Basic project structure with Svelte + TypeScript
- [x] Core API design and type definitions
- [x] Basic inline payment component (mock implementation)
- [x] CSS custom properties for theming
- [x] Development environment with live examples
- [x] Component lifecycle management

### 🔄 In Progress
- [ ] Integration with voltage-api-sdk
- [ ] QR code generation and display
- [ ] Payment status polling
- [ ] Real payment request creation

### 📅 Upcoming (Phase 2)
- [ ] Modal payment variant
- [ ] Enhanced error handling
- [ ] Copy-to-clipboard functionality
- [ ] Mobile optimization
- [ ] Accessibility improvements

## 🏗 Architecture

### Technology Stack
- **Framework**: Svelte (compiles to vanilla JS)
- **Language**: TypeScript
- **Styling**: CSS-in-JS with CSS Custom Properties
- **Build**: Vite + Rollup
- **Testing**: Vitest + Playwright

### Project Structure
```
src/
├── lib/
│   ├── VoltagePayments.ts           # Main factory class
│   ├── components/
│   │   ├── PaymentInline.svelte     # Inline payment component
│   │   └── PaymentInlineComponent.ts # TypeScript wrapper
│   └── types/
│       └── index.ts                 # Type definitions
├── main.ts                          # Library entry point
└── test-setup.ts                    # Test configuration
```

## 🎨 Component Variants

### Inline Payment (Available)
```javascript
VoltagePayments.create({
  variant: 'inline', // default
  apiKey: 'vltg_...',
  walletId: 'wallet_...',
  amount: 150000
}).mount('#container');
```

### Modal Payment (Coming in Phase 2)
```javascript
VoltagePayments.create({
  variant: 'modal',
  apiKey: 'vltg_...',
  walletId: 'wallet_...',
  amount: 150000
}).mount('#trigger-button');
```

### Payment Button (Coming in Phase 3)
```javascript
VoltagePayments.create({
  variant: 'button',
  apiKey: 'vltg_...',
  walletId: 'wallet_...',
  amount: 150000
}).mount('#payment-button');
```

## 🎨 Customization

### Appearance API
```javascript
VoltagePayments.create({
  appearance: {
    primaryColor: '#f7931a',
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: '8px',
    fontFamily: 'Inter, sans-serif',
    textColor: '#1f2937',
    secondaryTextColor: '#6b7280'
  }
});
```

### Themes
```javascript
VoltagePayments.create({
  theme: 'dark' // 'light', 'dark', 'auto'
});
```

## 📚 API Reference

### PaymentOptions
```typescript
interface PaymentOptions {
  // Required
  apiKey: string;
  walletId: string;

  // Payment Configuration
  amount?: number | null;
  paymentKind?: 'bolt11' | 'onchain' | 'bip21';
  description?: string;

  // UI Configuration
  variant?: 'inline' | 'modal' | 'button';
  theme?: 'light' | 'dark' | 'auto';
  appearance?: AppearanceConfig;

  // Callbacks
  onReady?: (payment: PaymentData) => void;
  onSuccess?: (payment: PaymentData) => void;
  onError?: (error: PaymentError) => void;
  // ... more callbacks
}
```

### PaymentComponent Methods
```typescript
interface PaymentComponent {
  mount(selector: string | HTMLElement): void;
  unmount(): void;
  destroy(): void;
  updateOptions(options: Partial<PaymentOptions>): void;
  getStatus(): PaymentStatus;
  getPaymentData(): PaymentData | null;
}
```

## 🧪 Testing

The development environment includes interactive examples:

1. **Basic Payment**: Simple payment with default styling
2. **Custom Payment**: Payment with custom appearance
3. **Any Amount Payment**: Payment where user specifies amount

Open `http://localhost:5173` after running `npm run dev` to test these examples.

## 🤝 Contributing

This project is in active development. Please see [PROJECT_PLAN.md](./PROJECT_PLAN.md) for detailed roadmap and implementation phases.

### Development Workflow
1. Make changes to components in `src/lib/`
2. Test in development environment at `http://localhost:5173`
3. Run tests: `npm run test`
4. Build: `npm run build`

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**Note**: This library is currently in development (Phase 1). The API may change before the first stable release. 