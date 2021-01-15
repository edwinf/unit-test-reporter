import {
  testCaseAnnotation,
  parseNunit,
  Annotation,
  TestResult,
  readResults
} from '../../src/nunit'
import {parseStringPromise} from 'xml2js'
import {promises as fs} from 'fs'
import {EOL} from 'os'

var path = require('path')
test('parse TestCase', async () => {
  var testPath = path.join('__tests__', 'nunit', 'testcase.xml')
  const data = await fs.readFile(testPath, 'utf8')

  const testCase: any = await parseStringPromise(data, {
    trim: true,
    mergeAttrs: true,
    explicitArray: false
  })

  const annotation = testCaseAnnotation(testCase['test-case'])

  expect(annotation).toBeTruthy()

  var expectedPath = path.join(
    'Assets',
    'Mirror',
    'Tests',
    'Editor',
    'NetworkIdentityTests.cs'
  )
  expect(annotation.path).toContain(expectedPath)

  expect(annotation.start_line).toBe(895)
  expect(annotation.end_line).toBe(895)
  expect(annotation.title).toBe(
    'Failed test ServerUpdate in Mirror.Tests.NetworkIdentityTests'
  )

  expect(annotation.message).toBe(`Expected: 1${EOL}  But was:  0`)
  expect(annotation.annotation_level).toBe('failure')
})

test('parse Results', async () => {
  var testPath = path.join('__tests__', 'nunit', 'editmode-results.xml')
  const data = await fs.readFile(testPath, 'utf8')

  const results = await parseNunit(data)
  expect(results.passed).toBe(332)
  expect(results.failed).toBe(1)

  const annotation = results.annotations[0]
  var expectedPath = path.join(
    'Assets',
    'Mirror',
    'Tests',
    'Editor',
    'NetworkIdentityTests.cs'
  )
  expect(annotation.path).toContain(expectedPath)

  expect(annotation.start_line).toBe(895)
  expect(annotation.end_line).toBe(895)
  expect(annotation.title).toBe(
    'Failed test ServerUpdate in Mirror.Tests.NetworkIdentityTests'
  )
  expect(annotation.message).toBe(`Expected: 1${EOL}  But was:  0`)
  expect(annotation.annotation_level).toBe('failure')
})

test('parse all Results', async () => {
  var testPath = path.join('__tests__', 'nunit', '*-results.xml')
  var results = await readResults(testPath)

  expect(results.annotations).toHaveLength(6)
})
