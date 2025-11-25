// Vite environment variable types

type ImportMetaEnv = {
  readonly VITE_APP_TITLE: string;
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  [key: string]: string | boolean;
};

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
