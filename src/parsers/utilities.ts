import {relative} from 'path'

export function sanitizePath(filename: string): string {
  if (filename.startsWith('/github/workspace')) {
    return relative('/github/workspace', filename)
  } else {
    return relative(process.cwd(), filename).replace(/\\/g, '/')
  }
}
