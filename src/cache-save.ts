/**
 * The entrypoint for the action.
 */
import { cacheSaveGo } from './setup-go/cache-save'

async function run() {
  await cacheSaveGo()
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run()
