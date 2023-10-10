/**
 * The entrypoint for the action.
 */
import { installGop } from './install-gop'

async function run(): Promise<void> {
  await installGop()
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run()
