/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_BASE44_API_KEY: string
  readonly VITE_MAP_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
