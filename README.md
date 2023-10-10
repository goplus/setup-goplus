# setup-goplus

This action sets up a [Go+](https://github.com/goplus/gop) environment for use
in actions by:

- Optionally downloading and caching a version of Go+ by version and adding to
  `PATH`.
- Registering problem matchers for error output.

## V1

- Supports `gop-version` and `go-version`
- Supports SemVer.

Ths action installs Go, and then installs Go+ using `git`.

## Usage

Version matching by [SemVer spec](https://github.com/npm/node-semver):

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: goplus/setup-goplus@v1
    with:
      go-version: '1.21.0'
      gop-version: '1.1.7' # The Go+ version to download (if necessary) and use.
  - run: gop version
```
