import test from 'ava'
import npm from 'npm'

test.before(async () => {
  await new Promise((resolve, reject) => {
    npm.load({}, err => {
      if (err != null) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
})

test.beforeEach(async () => {
  await new Promise((resolve, reject) => {
    npm.commands.uninstall(['puppeteer', 'puppeteer-core'], err => {
      if (err != null) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
})

const npmInstall = async (pkg: string): Promise<void> => {
  await new Promise((resolve, reject) => {
    npm.commands.install([pkg], err => {
      if (err != null) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

test.serial(t => {
  try {
    require('./index')
    t.fail()
  } catch {
    t.pass()
  }
})

if (process.env.CI == null) {
  process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true'
}

test.serial(async t => {
  await npmInstall('puppeteer')
  require('./index')
  t.pass()
})

test.serial(async t => {
  await npmInstall('puppeteer-core')
  require('./index')
  t.pass()
})
