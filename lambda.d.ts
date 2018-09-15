declare module '@serverless-chrome/lambda' {
  interface ILaunchOptions {
    flags?: string[]
    chromePath?: string
    port?: number
    forceLambdaLauncher?: boolean
  }

  interface IChrome {
    pid: number | null
    port: number
    url: string
    log: string
    errorLog: string
    pidFile: string
    metaData: {
      launchTime: number
      didLaunch: boolean
    }
    kill(): Promise<void>
  }

  const _launch: (options?: ILaunchOptions) => IChrome
  export default _launch
}
