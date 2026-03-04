/**
 * Declaraciones de tipos para "next/navigation" cuando el paquete next
 * no expone correctamente sus tipos (p. ej. node_modules incompleto).
 */
declare module "next/navigation" {
  export interface AppRouterInstance {
    push(href: string, options?: { scroll?: boolean }): void;
    replace(href: string, options?: { scroll?: boolean }): void;
    back(): void;
    forward(): void;
    refresh(): void;
    prefetch(href: string, options?: { onInvalidate?: () => void }): void;
  }

  export function useRouter(): AppRouterInstance;
  export function usePathname(): string;
  export function useParams(): Record<string, string | string[]>;
  export function useSearchParams(): ReadonlyURLSearchParams;
  export function redirect(url: string): never;
}
