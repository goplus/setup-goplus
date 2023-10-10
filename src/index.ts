/**
 * The entrypoint for the action.
 */
import setupGo from './setup-go/setup'
import { installGop } from './install-gop'

async function run(): Promise<void> {
  setupGo()
  await installGop()
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run()
