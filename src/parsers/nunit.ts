import {parseStringPromise} from 'xml2js'
import {Annotation} from '../types/annotation'
import {TestResult, TestResultCounts} from '../types/test-result'
import {UnitTestResultParser} from './parser'

export default class NunitParser extends UnitTestResultParser {
  private testCaseAnnotation(testcase: any): Annotation {
    const [filename, lineno] =
      'stack-trace' in testcase.failure
        ? this.getLocation(testcase.failure['stack-trace'])
        : ['unknown', 0]

    const sanitizedFilename = this.sanitizePath(filename)
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

      if (Array.isArray(childcases)) {
        testCases = testCases.concat(childcases)
      } else {
        testCases.push(childcases)
      }
    }

    return testCases
  }

  protected async parseResults(testData: string): Promise<TestResult> {
    const parsedXml: any = await parseStringPromise(testData, {
      trim: true,
      mergeAttrs: true,
      explicitArray: false
    })

    const testRun = parsedXml['test-run']

    const testCases = this.getTestCases(testRun)
    const failedCases = testCases.filter(tc => tc.result === 'Failed')

    const annotations = failedCases.map(s => this.testCaseAnnotation(s))

    return new TestResult(
      new TestResultCounts(
        parseInt(testRun.total),
        parseInt(testRun.passed),
        0,
        parseInt(testRun.skipped),
        parseInt(testRun.failed),
        0
      ),
      testRun.duration,
      annotations
    )
  }
}
