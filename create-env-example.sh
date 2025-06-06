#!/bin/bash

cat > .env.example << 'EOF'
# Voltage API Configuration
# Copy this file to .env and fill in your real Voltage API credentials

# Your Voltage API key from https://voltage.cloud/dashboard
VITE_VOLTAGE_API_KEY=your-api-key-here

# Your organization ID from the Voltage dashboard
VITE_VOLTAGE_ORGANIZATION_ID=your-org-id-here

# Your environment ID (e.g., production, staging)
VITE_VOLTAGE_ENVIRONMENT_ID=your-env-id-here

# The wallet ID you want to receive payments to
VITE_VOLTAGE_WALLET_ID=your-wallet-id-here

# Optional: Custom base URL (defaults to https://voltageapi.com/v1)
VITE_VOLTAGE_BASE_URL=https://voltageapi.com/v1

# Optional: Request timeout in milliseconds (defaults to 30000)
VITE_VOLTAGE_TIMEOUT=30000
EOF

echo ".env.example created successfully!" 