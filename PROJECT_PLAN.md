# Voltage Payment Component - Project Plan

## Overview

A lightweight, framework-agnostic payment component library that simplifies Bitcoin Lightning and on-chain payments for developers. This project builds on the existing `@voltage-api-sdk` to provide drop-in UI components similar to Stripe's Payment Element.

## Vision

Position Voltage as the "Stripe of Bitcoin payments" with an equally developer-friendly experience, enabling any developer to accept Bitcoin payments with a single script tag and minimal configuration.

## Core Value Proposition

- **Simple Integration**: Single script tag + minimal configuration
- **Complete Payment Flow**: Payment creation → QR display → Status polling → Completion
- **Framework Agnostic**: Works with vanilla JS, React, Vue, Angular, etc.
- **Bitcoin Native**: Supports Lightning (bolt11), on-chain, and BIP21 unified payments
- **Developer Friendly**: Familiar API patterns inspired by proven solutions

## Component Strategy

### Primary Component: `VoltagePayment`

A single, versatile payment element that handles the complete payment flow with three variants:

1. **Inline Payment Form** - Embeds directly in your page
2. **Modal Payment Dialog** - Triggered by a button click
3. **Payment Button** - One-click payment trigger (shows QR immediately)

### Core API Design

```javascript
// Main factory function
VoltagePayments.create(options)

// Options structure
{
  // Required Configuration
  apiKey: string,           // Voltage API key
  walletId: string,         // Target wallet ID

  // Payment Configuration
  amount?: number,          // Amount in msats, null for "any amount"
  paymentKind?: 'bolt11' | 'onchain' | 'bip21', // default: 'bip21'
  description?: string,     // Payment description
  currency?: 'btc',         // Future: support for 'usd'

  // UI Configuration
  variant?: 'inline' | 'modal' | 'button', // default: 'inline'
  theme?: 'light' | 'dark' | 'auto',       // default: 'auto'
  appearance?: {            // Custom styling
    primaryColor?: string,
    backgroundColor?: string,
    borderRadius?: string,
    fontFamily?: string
  },

  // Behavior Configuration
  autoClose?: boolean,      // Auto-close modal on success (default: true)
  showQRCode?: boolean,     // Show QR code (default: true)
  showCopyButton?: boolean, // Show copy payment request button (default: true)

  // Lifecycle Callbacks
  onReady?: (payment) => void,
  onQRGenerated?: (qrData, paymentRequest) => void,
  onStatusChange?: (status, payment) => void,
  onSuccess?: (payment) => void,
  onError?: (error) => void,
  onExpired?: (payment) => void,

  // Advanced Configuration
  pollingConfig?: {
    maxAttempts?: number,   // default: 60
    intervalMs?: number,    // default: 1000
    timeoutMs?: number      // default: 60000
  },
  organizationId?: string,  // Optional org ID override
  environmentId?: string    // Optional env ID override
}
```

## Integration Examples

### Basic E-commerce Checkout

```html
<script src="https://cdn.voltage.com/components/v1/voltage-payments.js"></script>
<div id="payment-container"></div>
<script>
  const payment = VoltagePayments.create({
    apiKey: "vltg_...",
    walletId: "wallet_...",
    amount: 500000, // 500 sats
    description: "Coffee purchase",
    variant: "inline",
    onSuccess: (payment) => {
      window.location.href = "/order-complete?payment=" + payment.id;
    },
  });
  payment.mount("#payment-container");
</script>
```

### Donation Button

```javascript
VoltagePayments.create({
  apiKey: "vltg_...",
  walletId: "wallet_...",
  amount: null, // any amount
  variant: "button",
  description: "Support our project",
  appearance: {
    primaryColor: "#ff6b35",
    borderRadius: "8px",
  },
  onSuccess: (payment) => {
    showThankYouMessage();
  },
}).mount("#donate-button");
```

### Modal Invoice Payment

```javascript
VoltagePayments.create({
  apiKey: "vltg_...",
  walletId: "wallet_...",
  amount: 2500000, // 2500 sats
  variant: "modal",
  paymentKind: "bolt11",
  description: "Invoice #12345",
  onSuccess: (payment) => {
    markInvoiceAsPaid(payment.id);
  },
}).mount("#invoice-pay-button");
```

## Technical Architecture

### Package Structure

```
@voltage-payments/components
├── dist/
│   ├── voltage-payments.js        # UMD bundle for CDN
│   ├── voltage-payments.esm.js    # ES modules
│   └── voltage-payments.css       # Default styles
├── src/
│   ├── core/
│   │   ├── VoltagePayments.ts     # Main factory class
│   │   ├── PaymentComponent.ts    # Base payment component
│   │   └── PaymentStatus.ts       # Status management
│   ├── variants/
│   │   ├── InlinePayment.ts       # Inline variant
│   │   ├── ModalPayment.ts        # Modal variant
│   │   └── ButtonPayment.ts       # Button variant
│   ├── ui/
│   │   ├── QRCode.ts             # QR code generation/display
│   │   ├── PaymentForm.ts        # Payment form UI
│   │   └── StatusIndicator.ts    # Status display
│   ├── utils/
│   │   ├── styling.ts            # Appearance API implementation
│   │   └── polling.ts            # Payment status polling
│   └── types/
│       └── index.ts              # TypeScript definitions
```

### Dependencies

- **Core**: `voltage-api-sdk` (existing)
- **QR Generation**: `qrcode` or similar lightweight library
- **Styling**: CSS-in-JS solution for theming
- **Build**: Rollup/Vite for bundling

### Browser Support

- Modern browsers (ES2017+)
- Mobile Safari, Chrome, Firefox
- Progressive enhancement for older browsers

## Technology Stack

### Framework Choice: Svelte (Recommended)

**Why Svelte is Perfect for This Project:**

- ✅ **Compiles to vanilla JS** - No runtime framework dependency in final bundle
- ✅ **Tiny bundle size** - Critical for CDN distribution and performance
- ✅ **Excellent DX** - Reactive, component-based development with minimal boilerplate
- ✅ **Framework agnostic output** - Works seamlessly with any frontend framework
- ✅ **Built-in TypeScript support** - First-class TypeScript integration
- ✅ **Scoped CSS** - Component styles don't leak or conflict with host sites
- ✅ **No virtual DOM overhead** - Direct DOM manipulation for better performance

**Bundle Size Comparison (gzipped):**

```
Svelte + CSS-in-JS:         ~15-25KB
React + Styled Components:  ~45-60KB
Vue + CSS Modules:          ~35-45KB
Vanilla TypeScript:         ~10-15KB (significantly more development overhead)
```

### Complete Tech Stack

```json
{
  "framework": "Svelte",
  "language": "TypeScript",
  "styling": "CSS-in-JS with CSS Custom Properties",
  "bundler": "Vite",
  "testing": "Vitest + Playwright",
  "qr": "qrcode-generator",
  "build": "Rollup (via SvelteKit)",
  "linting": "ESLint + Prettier",
  "ci": "GitHub Actions"
}
```

### Project Structure with Svelte

```
voltage-payment-component/
├── package.json
├── vite.config.ts
├── svelte.config.js
├── tsconfig.json
├── src/
│   ├── lib/
│   │   ├── VoltagePayments.ts          # Main factory class
│   │   ├── components/
│   │   │   ├── PaymentInline.svelte    # Inline payment variant
│   │   │   ├── PaymentModal.svelte     # Modal payment variant
│   │   │   ├── PaymentButton.svelte    # Button payment variant
│   │   │   ├── QRCode.svelte           # QR code display
│   │   │   ├── StatusIndicator.svelte  # Payment status display
│   │   │   ├── PaymentForm.svelte      # Amount/description form
│   │   │   └── LoadingSpinner.svelte   # Loading states
│   │   ├── stores/
│   │   │   ├── payment.ts              # Payment state management
│   │   │   └── appearance.ts           # Theme and styling state
│   │   ├── utils/
│   │   │   ├── styling.ts              # CSS custom properties + theming
│   │   │   ├── polling.ts              # Payment status polling logic
│   │   │   ├── clipboard.ts            # Copy-to-clipboard functionality
│   │   │   └── validators.ts           # Input validation
│   │   └── types/
│   │       ├── index.ts                # Public API types
│   │       ├── internal.ts             # Internal component types
│   │       └── appearance.ts           # Styling and theme types
│   ├── main.ts                         # Library entry point
│   └── app.html                        # Development HTML
├── examples/
│   ├── vanilla/
│   │   ├── index.html
│   │   └── script.js
│   ├── react/
│   ├── vue/
│   └── next/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── dist/
    ├── voltage-payments.js             # UMD build for CDN
    ├── voltage-payments.esm.js         # ES modules build
    ├── voltage-payments.d.ts           # TypeScript definitions
    └── voltage-payments.css            # Optional base styles
```

### Styling Strategy: CSS-in-JS with Custom Properties

**Why NOT Tailwind for This Project:**

- ❌ **CSS conflicts** - Could clash with host site's existing Tailwind installation
- ❌ **Bundle bloat** - Adds unnecessary CSS classes to user's page
- ❌ **Dependency burden** - Users would need Tailwind configuration
- ❌ **Specificity issues** - Hard to override host site styles

**Our CSS-in-JS Approach:**

```javascript
// Scoped styling with CSS custom properties
const getComponentStyles = (appearance) => `
  .voltage-payment {
    --vp-primary: ${appearance.primaryColor || "#f7931a"};
    --vp-bg: ${appearance.backgroundColor || "#ffffff"};
    --vp-border: ${appearance.borderColor || "#e5e7eb"};
    --vp-radius: ${appearance.borderRadius || "8px"};
    --vp-font: ${appearance.fontFamily || "system-ui, sans-serif"};
    --vp-text: ${appearance.textColor || "#1f2937"};
    --vp-text-secondary: ${appearance.secondaryTextColor || "#6b7280"};
  }
`;
```

### Build Configuration

**Vite Configuration:**

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  build: {
    lib: {
      entry: "src/main.ts",
      name: "VoltagePayments",
      formats: ["es", "umd"],
      fileName: (format) =>
        `voltage-payments.${format === "es" ? "esm" : format}.js`,
    },
    rollupOptions: {
      // Bundle everything for CDN distribution
      external: [],
      output: {
        globals: {},
      },
    },
    target: "es2017",
    minify: "terser",
    sourcemap: true,
  },
  define: {
    // Remove development code in production
    "process.env.NODE_ENV": '"production"',
  },
});
```

**SvelteKit Configuration:**

```javascript
// svelte.config.js
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/kit/vite";

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    package: {
      exports: {
        ".": "./dist/index.js",
      },
    },
  },
};

export default config;
```

### Component Architecture Example

**Svelte Component Structure:**

```svelte
<!-- PaymentInline.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { paymentStore } from '../stores/payment.js';
  import { appearanceStore } from '../stores/appearance.js';
  import QRCode from './QRCode.svelte';
  import StatusIndicator from './StatusIndicator.svelte';
  import LoadingSpinner from './LoadingSpinner.svelte';

  // Props (component API)
  export let apiKey: string;
  export let walletId: string;
  export let amount: number | null;
  export let description: string = '';
  export let paymentKind: 'bolt11' | 'onchain' | 'bip21' = 'bip21';

  // Internal state
  let paymentRequest = '';
  let status: PaymentStatus = 'generating';
  let error: string | null = null;

  // Event dispatcher for callbacks
  const dispatch = createEventDispatcher();

  onMount(async () => {
    try {
      await paymentStore.createPayment({
        apiKey,
        walletId,
        amount,
        description,
        paymentKind
      });

      // Subscribe to payment updates
      paymentStore.subscribe((state) => {
        status = state.status;
        paymentRequest = state.paymentRequest;
        error = state.error;

        // Dispatch events for callbacks
        if (status === 'completed') {
          dispatch('success', state.payment);
        }
      });
    } catch (err) {
      error = err.message;
      dispatch('error', err);
    }
  });

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(paymentRequest);
      // Show success feedback
    } catch (err) {
      // Fallback for older browsers
    }
  };
</script>

<div class="voltage-payment inline" style={$appearanceStore.styles}>
  <div class="payment-header">
    <h3 class="payment-title">Complete Payment</h3>
    <StatusIndicator {status} />
  </div>

  {#if status === 'generating'}
    <LoadingSpinner />
  {:else if error}
    <div class="error-message" role="alert">
      {error}
    </div>
  {:else if paymentRequest}
    <div class="payment-content">
      <QRCode data={paymentRequest} size={200} />

      <div class="payment-details">
        <div class="payment-request">
          <label for="payment-request-input">Payment Request:</label>
          <input
            id="payment-request-input"
            type="text"
            readonly
            value={paymentRequest}
            class="payment-request-input"
          />
          <button
            type="button"
            on:click={copyToClipboard}
            class="copy-button"
            aria-label="Copy payment request"
          >
            Copy
          </button>
        </div>

        {#if amount}
          <div class="amount-display">
            Amount: {amount / 100000000} BTC
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
  }

  .payment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .payment-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .payment-content {
    text-align: center;
  }

  .payment-details {
    margin-top: 1rem;
    text-align: left;
  }

  .payment-request {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .payment-request-input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid var(--vp-border);
    border-radius: calc(var(--vp-radius) * 0.5);
    font-family: monospace;
    font-size: 0.875rem;
  }

  .copy-button {
    padding: 0.5rem 1rem;
    background: var(--vp-primary);
    color: white;
    border: none;
    border-radius: calc(var(--vp-radius) * 0.5);
    cursor: pointer;
    font-weight: 500;
  }

  .copy-button:hover {
    opacity: 0.9;
  }

  .amount-display,
  .description {
    margin-bottom: 0.5rem;
    color: var(--vp-text-secondary);
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

    .payment-request {
      flex-direction: column;
      align-items: stretch;
    }

    .copy-button {
      margin-top: 0.5rem;
    }
  }
</style>
```

### Testing Strategy

**Unit Testing with Vitest:**

```typescript
// tests/unit/PaymentComponent.test.ts
import { render, screen } from "@testing-library/svelte";
import { vi } from "vitest";
import PaymentInline from "../src/lib/components/PaymentInline.svelte";

describe("PaymentInline", () => {
  it("renders payment form with QR code", async () => {
    render(PaymentInline, {
      apiKey: "test-key",
      walletId: "test-wallet",
      amount: 100000,
    });

    expect(screen.getByText("Complete Payment")).toBeInTheDocument();
    // Test QR code generation, status updates, etc.
  });
});
```

**E2E Testing with Playwright:**

```typescript
// tests/e2e/payment-flow.spec.ts
import { test, expect } from "@playwright/test";

test("complete payment flow", async ({ page }) => {
  await page.goto("/examples/vanilla/");

  // Test payment creation
  await page.click("#create-payment");
  await expect(page.locator(".voltage-payment")).toBeVisible();

  // Test QR code display
  await expect(page.locator("canvas")).toBeVisible();

  // Test copy functionality
  await page.click(".copy-button");
  // Verify clipboard content
});
```

### Performance Considerations

**Bundle Size Optimization:**

- Tree-shaking enabled by default with ES modules
- Dynamic imports for large dependencies (QR generation)
- Minimal runtime overhead with Svelte compilation
- CSS custom properties instead of CSS-in-JS runtime

**Runtime Performance:**

- No virtual DOM overhead
- Direct DOM manipulation
- Efficient reactivity system
- Lazy loading of non-critical features

**Target Metrics:**

- **Bundle Size**: < 25KB gzipped
- **First Paint**: < 200ms
- **Time to Interactive**: < 500ms
- **QR Generation**: < 100ms

## Implementation Phases

### Phase 1: MVP (2-3 weeks)

**Goal**: Basic inline payment component with core functionality

**Features**:

- ✅ Inline payment component
- ✅ Basic QR code generation and display
- ✅ Payment status polling using existing SDK
- ✅ Simple theming (light/dark)
- ✅ BIP21 payment support
- ✅ Basic error handling
- ✅ CDN distribution

**Deliverables**:

- Working inline component
- CDN-hosted script
- Basic documentation
- Integration examples

### Phase 2: Enhanced UX (2-3 weeks)

**Goal**: Improved user experience and additional variants

**Features**:

- ✅ Modal payment variant
- ✅ Custom styling API (Appearance API)
- ✅ Enhanced error handling and loading states
- ✅ Mobile optimization
- ✅ Copy-to-clipboard functionality
- ✅ Payment expiration handling
- ✅ Accessibility improvements

**Deliverables**:

- Modal component
- Comprehensive styling options
- Mobile-responsive design
- Enhanced documentation

### Phase 3: Advanced Features (3-4 weeks)

**Goal**: Production-ready with advanced features

**Features**:

- ✅ Payment button variant
- ✅ NPM package distribution
- ✅ TypeScript definitions
- ✅ Webhook integration helpers
- ✅ Advanced customization options
- ✅ Payment method selection UI
- ✅ Amount input for "any amount" payments

**Deliverables**:

- Complete component library
- NPM package
- Production documentation
- Framework integration guides

### Phase 4: Framework Integration (Ongoing)

**Goal**: Framework-specific wrappers and integrations

**Features**:

- ✅ React wrapper component
- ✅ Vue wrapper component
- ✅ Angular wrapper component
- ✅ Framework-specific documentation
- ✅ Example applications

**Deliverables**:

- `@voltage-payments/react`
- `@voltage-payments/vue`
- `@voltage-payments/angular`
- Framework example projects

## Distribution Strategy

### 1. CDN Distribution (Primary)

```html
<script src="https://cdn.voltage.com/components/v1/voltage-payments.js"></script>
```

### 2. NPM Package

```bash
npm install @voltage-payments/components
```

### 3. Framework Wrappers

```bash
npm install @voltage-payments/react
npm install @voltage-payments/vue
npm install @voltage-payments/angular
```

## Quality Assurance

### Testing Strategy

- **Unit Tests**: Core component logic
- **Integration Tests**: SDK integration
- **Visual Tests**: Component rendering
- **E2E Tests**: Complete payment flows
- **Browser Testing**: Cross-browser compatibility

### Documentation

- **Quick Start Guide**: 5-minute integration
- **API Reference**: Complete option documentation
- **Examples**: Common use cases
- **Migration Guide**: From direct SDK usage
- **Troubleshooting**: Common issues and solutions

## Success Metrics

### Developer Experience

- **Time to Integration**: < 5 minutes for basic setup
- **Lines of Code**: < 10 lines for typical integration
- **Documentation Quality**: Self-service adoption

### Technical Performance

- **Bundle Size**: < 50KB gzipped
- **Load Time**: < 500ms on 3G
- **QR Generation**: < 100ms
- **Payment Polling**: Responsive status updates

### Business Impact

- **Adoption Rate**: Track component usage vs direct SDK
- **Developer Feedback**: Survey satisfaction scores
- **Integration Success**: Reduce support tickets

## Risk Mitigation

### Technical Risks

- **SDK Breaking Changes**: Pin to stable SDK versions, comprehensive testing
- **Browser Compatibility**: Progressive enhancement, polyfills
- **Performance**: Bundle size monitoring, lazy loading

### Product Risks

- **Feature Creep**: Strict MVP scope, phased approach
- **User Confusion**: Clear documentation, simple API
- **Maintenance Burden**: Automated testing, clear architecture

## Future Considerations

### Potential Extensions

- **Recurring Payments**: Subscription payment flows
- **Multi-Currency**: USD denomination support
- **Advanced Customization**: White-label styling
- **Analytics Integration**: Payment funnel tracking
- **Saved Payment Methods**: Customer payment preferences

### Integration Opportunities

- **E-commerce Platforms**: Shopify, WooCommerce plugins
- **No-Code Tools**: Webflow, Bubble integrations
- **Payment Processors**: Middleware compatibility

## Getting Started

### Prerequisites

- Existing `voltage-api-sdk` knowledge
- Voltage API credentials
- Bitcoin wallet for testing

### Development Setup

1. Clone repository
2. Install dependencies
3. Set up development environment
4. Run example applications
5. Begin with Phase 1 implementation

---

_This plan serves as the roadmap for developing the Voltage Payment Component library. It should be updated as development progresses and requirements evolve._
