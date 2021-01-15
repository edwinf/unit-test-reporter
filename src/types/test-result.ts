import {Annotation} from './annotation'

export class TestResult {
  public constructor(
    public readonly resultCounts: TestResultCounts,
    public readonly totalduration: number,
    public readonly annotations: Annotation[]
  ) {}

  public merge(testResult: TestResult): TestResult {
    return new TestResult(
      this.resultCounts.merge(testResult.resultCounts),
      this.totalduration + testResult.totalduration,
      this.annotations.concat(testResult.annotations)
    )
  }
}

export class TestResultCounts {
  public constructor(
    public readonly total: number,
    public readonly passed: number,
    public readonly warning: number,
    public readonly skipped: number,
    public readonly failed: number,
    public readonly timeout: number
  ) {}

  public merge(testResultCounts: TestResultCounts): TestResultCounts {
    return new TestResultCounts(
      this.total + testResultCounts.total,
      this.passed + testResultCounts.passed,
      this.warning + testResultCounts.warning,
      this.skipped + testResultCounts.skipped,
      this.failed + testResultCounts.failed,
      this.timeout + testResultCounts.timeout
    )
  }
}
