declare module 'chrome-remote-interface' {
  interface IVersion {
    webSocketDebuggerUrl: string
  }

  export const Version: () => Promise<IVersion>
}
