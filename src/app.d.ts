// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }
}

// Svelte module declarations
declare module "*.svelte" {
  import type { ComponentType, ComponentConstructorOptions } from "svelte";
  const component: ComponentType;
  export default component;
}

// Vite environment variables
interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
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

export {};
