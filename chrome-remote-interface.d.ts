declare module 'chrome-remote-interface' {
  interface IVersion {
    webSocketDebuggerUrl: string
  }

  export function Version (): Promise<IVersion>
}
