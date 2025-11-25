// Vite environment variable types

type ImportMetaEnv = {
  readonly VITE_APP_TITLE: string;
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly REACT_APP_API_URL?: string;
  readonly REACT_APP_ENV?: 'development' | 'production' | 'unknown';
};

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
