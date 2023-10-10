/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import exp from 'constants'
import * as main from '../src/install-gop'

// Mock the action's entrypoint
const installGopMock = jest.spyOn(main, 'installGop').mockImplementation()

describe('index', () => {
  it('calls installGop when imported', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    console.log('+++++++++')
    console.log(require('../src/index'))
    console.log('------------')
    expect(installGopMock).toHaveBeenCalled()
  })
})
