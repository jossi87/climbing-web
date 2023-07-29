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
