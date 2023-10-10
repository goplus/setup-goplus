/**
 * The entrypoint for the action.
 */
import cacheSaveGo from './setup-go/cache-save'

function run(): void {
  cacheSaveGo()
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run()
