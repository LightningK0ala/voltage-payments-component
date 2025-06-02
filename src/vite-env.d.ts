/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VOLTAGE_API_KEY?: string;
  readonly VITE_VOLTAGE_ORGANIZATION_ID?: string;
  readonly VITE_VOLTAGE_ENVIRONMENT_ID?: string;
  readonly VITE_VOLTAGE_WALLET_ID?: string;
  readonly VITE_VOLTAGE_BASE_URL?: string;
  readonly VITE_VOLTAGE_TIMEOUT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
