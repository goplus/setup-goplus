/**
 * The entrypoint for the action.
 */
import { setupGo } from './setup-go/setup'
import { installGop } from './install-gop'

console.log('============== index')

async function run() {
  await setupGo()
  await installGop()
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run()
