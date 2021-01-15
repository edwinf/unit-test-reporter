import {parseStringPromise} from 'xml2js'
import {create} from '@actions/glob'
import {promises as fs} from 'fs'
import {Annotation} from '../types/annotation'
import {TestResult} from '../types/test-result'
import {UnitTestResultParser} from './parser'
import {sanitizePath} from './utilities'

export default class NunitParser implements UnitTestResultParser {
  public async readResults(path: string): Promise<TestResult> {
    let results = new TestResult(0, 0, [])

    for await (const result of this.resultGenerator(path))
      results = this.combine(results, result)

    return results
  }

  private getLocation(stacktrace: string): [string, number] {
    // assertions stack traces as reported by unity
    const matches = stacktrace.matchAll(/in (.*):(\d+)/g)

    for (const match of matches) {
      const lineNo = parseInt(match[2])
      if (lineNo !== 0) return [match[1], lineNo]
    }

    // assertions stack traces as reported by dotnet
    const matches2 = stacktrace.matchAll(/in (.*):line (\d+)/g)

    for (const match of matches2) {
      const lineNo = parseInt(match[2])
      if (lineNo !== 0) return [match[1], lineNo]
    }

    // exceptions stack traces as reported by unity
    const matches3 = stacktrace.matchAll(/\(at (.*):(\d+)\)/g)

    for (const match of matches3) {
      const lineNo = parseInt(match[2])
      if (lineNo !== 0) return [match[1], lineNo]
    }

    // exceptions stack traces as reported by dotnet
    const matches4 = stacktrace.matchAll(/\(at (.*):line (\d+)\)/g)

    for (const match of matches4) {
      const lineNo = parseInt(match[2])
      if (lineNo !== 0) return [match[1], lineNo]
    }

    return ['unknown', 0]
  }

  private testCaseAnnotation(testcase: any): Annotation {
    const [filename, lineno] =
      'stack-trace' in testcase.failure
        ? this.getLocation(testcase.failure['stack-trace'])
        : ['unknown', 0]

    const sanitizedFilename = sanitizePath(filename)
    const message = testcase.failure.message
    const classname = testcase.classname
    const methodname = testcase.methodname

    const stacktrace =
      'stack-trace' in testcase.failure
        ? testcase.failure['stack-trace'].substring(0, 65536)
        : ''

    return new Annotation(
      sanitizedFilename,
      lineno,
      lineno,
      0,
      0,
      'failure',
      `Failed test ${methodname} in ${classname}`,
      message,
      stacktrace
    )
  }

  private getTestCases(testsuite: any): any[] {
    let testCases = []

    if ('test-suite' in testsuite) {
      const childsuits = testsuite['test-suite']

      const childsuitCases = Array.isArray(childsuits)
        ? childsuits.map(s => this.getTestCases(s))
        : [this.getTestCases(childsuits)]

      testCases = childsuitCases.flat()
    }

    if ('test-case' in testsuite) {
      const childcases = testsuite['test-case']

      if (Array.isArray(childcases)) testCases = testCases.concat(childcases)
      else testCases.push(childcases)
    }

    return testCases
  }

  private async parseNunit(nunitReport: string): Promise<TestResult> {
    const nunitResults: any = await parseStringPromise(nunitReport, {
      trim: true,
      mergeAttrs: true,
      explicitArray: false
    })

    const testRun = nunitResults['test-run']

    const testCases = this.getTestCases(testRun)
    const failedCases = testCases.filter(tc => tc.result === 'Failed')

    const annotations = failedCases.map(s => this.testCaseAnnotation(s))

    return new TestResult(
      parseInt(testRun.passed),
      parseInt(testRun.failed),
      annotations
    )
  }

  private combine(result1: TestResult, result2: TestResult): TestResult {
    const passed = result1.passed + result2.passed
    const failed = result1.failed + result2.failed
    const annotations = result1.annotations.concat(result2.annotations)

    return new TestResult(passed, failed, annotations)
  }

  private async *resultGenerator(path: string): AsyncGenerator<TestResult> {
    const globber = await create(path, {followSymbolicLinks: false})

    for await (const file of globber.globGenerator()) {
      const data = await fs.readFile(file, 'utf8')
      yield this.parseNunit(data)
    }
  }
}
