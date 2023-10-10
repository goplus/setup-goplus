import * as core from '@actions/core'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { execSync } from 'child_process'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function installGop(): Promise<void> {
  try {
    const versionSpec = resolveVersionInput()
    const gopDir = clone(versionSpec)
    install(gopDir)
    test(versionSpec)
    core.setOutput('gop-version', versionSpec)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

function clone(versionSpec: string): string {
  // git clone https://github.com/goplus/gop.git with tag $versionSpec to $HOME/workdir/gop
  const workDir = path.join(os.homedir(), 'workdir')
  if (fs.existsSync(workDir)) {
    fs.rmSync(workDir, { recursive: true })
  }
  fs.mkdirSync(workDir)
  core.info(`Cloning gop ${versionSpec} to ${workDir} ...`)
  const cmd = `git clone --depth 1 --branch ${versionSpec} https://github.com/goplus/gop.git`
  execSync(cmd, { cwd: workDir, stdio: 'inherit' })
  core.info('gop cloned')
  return path.join(workDir, 'gop')
}

function install(gopDir: string): void {
  core.info(`Installing gop ${gopDir} ...`)
  execSync(`ls ${os.homedir()}`)
  const bin = path.join(os.homedir(), 'bin')
  execSync('go run cmd/make.go -install', {
    cwd: gopDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      GOBIN: bin
    }
  })
  core.info('gop installed')
}

function test(versionSpec: string): void {
  const out = execSync('gop env GOPVERSION', { stdio: 'inherit' })
  const actualVersion = out.toString().trim()
  if (actualVersion !== versionSpec) {
    throw new Error(
      `Installed gop version ${actualVersion} does not match expected version ${versionSpec}`
    )
  }
  core.info(`Installed gop version ${actualVersion}`)
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
