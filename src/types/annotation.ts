export class Annotation {
  public constructor(
    public readonly path: string,
    public readonly start_line: number,
    public readonly end_line: number,
    public readonly start_column: number,
    public readonly end_column: number,
    public readonly annotation_level: 'failure' | 'notice' | 'warning',
    public readonly title: string,
    public readonly message: string,
    public readonly raw_details: string
  ) {}
}
