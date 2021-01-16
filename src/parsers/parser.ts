import {create} from '@actions/glob'
import {relative} from 'path'
import {TestResult, TestResultCounts} from '../types/test-result'
import {promises as fs} from 'fs'

export abstract class UnitTestResultParser {
  public async readResults(path: string): Promise<TestResult> {
    let results = new TestResult(new TestResultCounts(0, 0, 0, 0, 0, 0), 0, [])

    for await (const result of this.resultGenerator(path)) {
      results = results.merge(result)
    }

    return results
  }

  protected abstract parseResults(nunitReport: string): Promise<TestResult>

  protected sanitizePath(filename: string): string {
    if (filename.startsWith('/github/workspace')) {
      return relative('/github/workspace', filename)
    } else {
      return relative(process.cwd(), filename).replace(/\\/g, '/')
    }
  }

  protected getLocation(stacktrace: string): [string, number] {
    // assertions stack traces as reported by unity
    const matches = stacktrace.matchAll(/in (.*):(\d+)/g)

    for (const match of matches) {
      const lineNo = parseInt(match[2])
      if (lineNo !== 0) {
        return [match[1], lineNo]
      }
    }

    // assertions stack traces as reported by dotnet
    const matches2 = stacktrace.matchAll(/in (.*):line (\d+)/g)

    for (const match of matches2) {
      const lineNo = parseInt(match[2])
      if (lineNo !== 0) {
        return [match[1], lineNo]
      }
    }

    // exceptions stack traces as reported by unity
    const matches3 = stacktrace.matchAll(/\(at (.*):(\d+)\)/g)

    for (const match of matches3) {
      const lineNo = parseInt(match[2])
      if (lineNo !== 0) {
        return [match[1], lineNo]
      }
    }

    // exceptions stack traces as reported by dotnet
    const matches4 = stacktrace.matchAll(/\(at (.*):line (\d+)\)/g)

    for (const match of matches4) {
      const lineNo = parseInt(match[2])
      if (lineNo !== 0) {
        return [match[1], lineNo]
      }
    }

    return ['unknown', 0]
  }

  private async *resultGenerator(path: string): AsyncGenerator<TestResult> {
    const globber = await create(path, {followSymbolicLinks: false})

    for await (const file of globber.globGenerator()) {
      const data = await fs.readFile(file, 'utf8')
      yield this.parseResults(data)
    }
  }
}
