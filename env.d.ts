interface ImportMeta extends ImportMetaStatusBar {
  pkgDataDir: string

  lock: ImportMetaLock
}

interface ImportMetaStatusBar {
  executableFree: string
  executableMpstat: string
}

interface ImportMetaLock {
  previewMode: boolean
}


declare const SRC: string

declare module "inline:*" {
  const content: string
  export default content
}

declare module "*.scss" {
  const content: string
  export default content
}

declare module "*.blp" {
  const content: string
  export default content
}

declare module "*.css" {
  const content: string
  export default content
}
