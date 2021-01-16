import {parseStringPromise} from 'xml2js'
import {Annotation} from '../types/annotation'
import {TestResult, TestResultCounts} from '../types/test-result'
import {UnitTestResultParser} from './parser'

export default class TrxParser extends UnitTestResultParser {
  protected async parseResults(testData: string): Promise<TestResult> {
    const parsedXml: any = await parseStringPromise(testData, {
      trim: true,
      mergeAttrs: true,
      explicitArray: false
    })

    const testRun = parsedXml['TestRun']

    const results = this.getResults(testRun)
    const failedResults = results.filter(r => r.outcome !== 'Passed')

    const annotations = failedResults.map(s => this.resultAnnotations(s))
    const duration =
      new Date(testRun.Times.finish).valueOf() -
      new Date(testRun.Times.start).valueOf()
    return new TestResult(
      new TestResultCounts(
        parseInt(testRun.ResultSummary.Counters.total),
        parseInt(testRun.ResultSummary.Counters.passed),
        parseInt(testRun.ResultSummary.Counters.warning),
        parseInt(testRun.ResultSummary.Counters.notExecuted),
        parseInt(testRun.ResultSummary.Counters.failed),
        parseInt(testRun.ResultSummary.Counters.timeout)
      ),
      duration,
      annotations
    )
  }

  private resultAnnotations(testResult: any): Annotation {
    const errorInfo = testResult.Output.ErrorInfo
    let [filename, lineno] = ['unknown', 0]
    const stackTrace = errorInfo.StackTrace || ''
    if (stackTrace.length > 0) {
      ;[filename, lineno] = this.getLocation(errorInfo.StackTrace)
    }

    const sanitizedFilename = this.sanitizePath(filename)
    const message = errorInfo.Message

    return new Annotation(
      sanitizedFilename,
      lineno,
      lineno,
      0,
      0,
      testResult.outcome === 'Failed'
        ? 'failure'
        : testResult.outcome === 'Warning'
        ? 'warning'
        : 'notice',
      `Failed test ${testResult.testName}`,
      message,
      stackTrace.substring(0, 65536)
    )
  }

  private getResults(results: any): any[] {
    let unitTestResults: any = []

    if (results.Results && results.Results.UnitTestResult) {
      const utrs = results.Results.UnitTestResult

      if (Array.isArray(utrs)) {
        unitTestResults = unitTestResults.concat(utrs)
      } else {
        unitTestResults.push(utrs)
      }
    }

    return unitTestResults
  }
}
