import Launch from '@serverless-chrome/lambda'
import Puppeteer from 'puppeteer'
import CDP from 'chrome-remote-interface'

let puppeteer: typeof Puppeteer
try {
  puppeteer = require('puppeteer-core')
} catch {
  try {
    puppeteer = require('puppeteer')
  } catch (e) {
    console.error('this module requires puppeteer or puppeteer-core ~> 1.8.0')
    throw e
  }
}

interface IChromeLaunchOptions {
  flags?: string[]
  chromePath?: string
  port?: number
  forceLambdaLauncher?: boolean
}

const isPuppeteerLaunchOptions = (
  options: Puppeteer.LaunchOptions | IChromeLaunchOptions
): options is Puppeteer.LaunchOptions => {
  if (options == null) {
    return false
  }
  return (<IChromeLaunchOptions>options).flags == null
    && (<IChromeLaunchOptions>options).chromePath == null
    && (<IChromeLaunchOptions>options).port == null
    && (<IChromeLaunchOptions>options).forceLambdaLauncher == null
}

export default async (
  options?: Puppeteer.LaunchOptions | IChromeLaunchOptions
): Promise<{ browser: Puppeteer.Browser, kill: () => Promise<void> }> => {
  let puppeteerOptions: Puppeteer.LaunchOptions
  let chromeOptions: IChromeLaunchOptions | undefined
  if (options == null) {
    puppeteerOptions = {}
  } else if (isPuppeteerLaunchOptions(options)) {
    puppeteerOptions = options
  } else {
    puppeteerOptions = {}
    chromeOptions = options
  }

  if (process.env.CI != null || process.env.DYNO != null) {
    puppeteerOptions = {
      ...puppeteerOptions,
      args: (puppeteerOptions.args || [])
        .concat('--no-sandbox', '--disable-setuid-sandbox') }
  }

  let browser: Puppeteer.Browser
  let kill: () => Promise<void>
  if (process.env.AWS_EXECUTION_ENV != null) {
    let launch: typeof Launch
    let cdp: typeof CDP
    try {
      launch = require('@serverless-chrome/lambda')
      cdp = require('chrome-remote-interface')
    } catch (e) {
      console.error(
        'this module reuires chrome-remote-interface, '
        + '@serverless-chrome/lambda on AWS'
      )
      throw e
    }
    const chrome = launch(chromeOptions)
    browser = await puppeteer.connect({
      browserWSEndpoint: (await cdp.Version()).webSocketDebuggerUrl
    })
    kill = async () => {
      await browser.close()
      await chrome.kill()
    }
  } else {
    browser = await puppeteer.launch(puppeteerOptions)
    kill = async () => {
      await browser.close()
    }
  } 
  return {
    browser,
    kill
  }
}
