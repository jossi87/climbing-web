declare var __isBrowser__: boolean;

interface Window {
    // Allow us to put arbitrary objects in window
    [key: string]: any;
}

declare namespace JSX {
    interface IntrinsicElements {
        center: any
    }
}