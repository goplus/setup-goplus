import * as core from '@actions/core'
import fs from 'fs'
import path from 'path'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function installGop(): Promise<void> {
  console.log('run =====')
  try {
    const versionSpec = resolveVersionInput()
    core.setOutput('gop-version', versionSpec)
    console.log('after run =====')
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

function resolveVersionInput(): string {
  let version = core.getInput('gop-version')
  const versionFilePath = core.getInput('gop-version-file')

  if (version && versionFilePath) {
    core.warning(
      'Both gop-version and gop-version-file inputs are specified, only gop-version will be used'
    )
  }

  if (version) {
    return version
  }

  if (versionFilePath) {
    if (!fs.existsSync(versionFilePath)) {
      throw new Error(
        `The specified gop version file at: ${versionFilePath} does not exist`
      )
    }
    version = parseGopVersionFile(versionFilePath)
  }

  return version
}

export function parseGopVersionFile(versionFilePath: string): string {
  const contents = fs.readFileSync(versionFilePath).toString()

  if (
    path.basename(versionFilePath) === 'gop.mod' ||
    path.basename(versionFilePath) === 'gop.work'
  ) {
    const match = contents.match(/^gop (\d+(\.\d+)*)/m)
    return match ? match[1] : ''
  }

  return contents.trim()
}
