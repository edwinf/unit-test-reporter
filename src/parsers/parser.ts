import {TestResult} from '../types/test-result'

export interface UnitTestResultParser {
  readResults(fileGlob: string): Promise<TestResult>
}
