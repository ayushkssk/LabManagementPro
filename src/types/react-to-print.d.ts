// Type augmentation for react-to-print to match the actual runtime API used in the app
// This fixes TS errors like: "Object literal may only specify known properties, and 'content' does not exist in type 'UseReactToPrintOptions'"

// If the library updates its types in the future, this augmentation will simply merge
// and should not break anything.

import type { RefObject } from 'react';

declare module 'react-to-print' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface UseReactToPrintOptions {
    // The element to print
    content?: () => HTMLElement | null;
    // Newer API uses a direct ref to the content instead of a function
    contentRef?: RefObject<HTMLElement> | null;
    // Optional options commonly used in this codebase
    documentTitle?: string;
    pageStyle?: string | ((printWindow: Window) => string);
    removeAfterPrint?: boolean;
    onAfterPrint?: () => void | Promise<void>;
    onBeforePrint?: () => void | Promise<void>;
    onBeforeGetContent?: () => void | Promise<void>;
  }

  // Explicitly declare the named export for the hook so TS recognizes it
  // The hook returns a function you call to trigger printing
  export function useReactToPrint(options: UseReactToPrintOptions): () => void;
}
