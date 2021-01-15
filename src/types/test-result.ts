import {Annotation} from './annotation'

export class TestResult {
  public constructor(
    public readonly passed: number,
    public readonly failed: number,
    public readonly totalduration: number,
    public readonly annotations: Annotation[]
  ) {}
}
