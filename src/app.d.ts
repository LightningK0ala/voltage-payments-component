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

export {};
