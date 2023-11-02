import * as core from '@actions/core'
import * as semver from 'semver'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { execSync } from 'child_process'

const GOPLUS_REPO = 'https://github.com/goplus/gop.git'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function installGop(): Promise<void> {
  try {
    const versionSpec = resolveVersionInput() || ''
    const versions = semver.sort(fetchVersions())
    core.info(versions.join('\n'))
    let version: string | null = null
    if (!versionSpec) {
      version = versions[0]
      core.warning(`No gop-version specified, using latest version: ${version}`)
    } else {
      version = semver.maxSatisfying(versions, versionSpec)
    }

    if (!version) {
      throw new Error(
        `Unable to find a version that satisfies the version spec '${versionSpec}'`
      )
    }
    core.info(`Selected version ${version} by spec ${versionSpec}`)
    const tagVersion = `v${version}`
    const gopDir = clone(tagVersion)
    install(gopDir)
    test(tagVersion)
    core.setOutput('gop-version', version)
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
  const cmd = `git clone --depth 1 --branch ${versionSpec} ${GOPLUS_REPO}`
  execSync(cmd, { cwd: workDir, stdio: 'inherit' })
  core.info('gop cloned')
  return path.join(workDir, 'gop')
}

function install(gopDir: string): void {
  core.info(`Installing gop ${gopDir} ...`)
  const bin = path.join(os.homedir(), 'bin')
  execSync('go run cmd/make.go -install', {
    cwd: gopDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      GOBIN: bin
    }
  })
  core.addPath(bin)
  core.info('gop installed')
}

function test(versionSpec: string): void {
  core.info(`Testing gop ${versionSpec} ...`)
  const out = execSync('gop env GOPVERSION', { env: process.env })
  const actualVersion = out.toString().trim()
  if (actualVersion !== versionSpec) {
    throw new Error(
      `Installed gop version ${actualVersion} does not match expected version ${versionSpec}`
    )
  }
  core.info(`Installed gop version ${actualVersion}`)
}

function fetchVersions(): string[] {
  const cmd = `git -c versionsort.suffix=- ls-remote --tags --sort=v:refname ${GOPLUS_REPO}`
  const out = execSync(cmd).toString()
  const versions = out
    .split('\n')
    .filter(s => s)
    .map(s => s.split('\t')[1].replace('refs/tags/', ''))
    .map(s => s.replace(/^v/, ''))
  return versions
}

function resolveVersionInput(): string | undefined {
  let version = process.env['gop-version']
  const versionFilePath = process.env['gop-version-file']

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
