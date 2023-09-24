import { operations } from "./swagger";

interface Window {
  // Allow us to put arbitrary objects in window
  [key: string]: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    center: any;
  }
}

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

type Success<
  T extends keyof operations,
  content = "application/json",
> = operations[T]["responses"]["200"]["content"][content];

type WithoutFirstParameter<T extends (...args: unknown[]) => unknown> =
  Parameters<T> extends [unknown, ...infer U] ? U : never;
