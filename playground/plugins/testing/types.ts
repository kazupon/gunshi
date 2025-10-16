export interface MyPluginOptions {
  debug?: boolean
  loadConfig?: () => { apiUrl?: string; timeout?: number }
}

export interface MyPluginExtension {
  greet: (name: string) => string
  someMethod: () => string
  showVersion: () => string
  showHeader: () => Promise<string>
  getConfig: () => { apiUrl: string; timeout: number }
}
