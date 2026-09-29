/**
 * `libheif-js` ships Emscripten typings for its factory entry points only, so the pre-bundled wasm
 * module this app lazy-loads is declared here with the small API surface that is actually used.
 * The wasm binary is embedded in the bundle, so no asset has to be served next to it.
 */
declare module 'libheif-js/libheif-wasm/libheif-bundle.mjs' {
  /** An image inside a HEIF container; `display` fills an `ImageData` with RGBA pixels. */
  export interface HeifImage {
    get_width(): number;
    get_height(): number;
    is_primary(): boolean;
    display(imageData: ImageData, callback: (result: ImageData | null) => void): void;
    /** Releases the wasm-side image data. */
    free(): void;
  }

  export interface HeifDecoder {
    /** Returns the top-level (non-hidden) images of the container. */
    decode(buffer: Uint8Array): HeifImage[];
  }

  /** The instantiated wasm module. */
  export interface HeifModule {
    HeifDecoder: new () => HeifDecoder;
  }

  /**
   * Emscripten module factory (the build injects the wasm binary itself). Depending on the build
   * it resolves to the module, to a `{ default: module }` wrapper, or to a promise of either.
   */
  export default function createLibheif(options?: {
    wasmBinary?: ArrayBuffer;
  }): HeifModule | { default: HeifModule } | Promise<HeifModule | { default: HeifModule }>;
}
