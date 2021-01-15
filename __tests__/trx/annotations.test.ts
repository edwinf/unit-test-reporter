import {parseStringPromise} from 'xml2js'
import {promises as fs} from 'fs'
import {EOL} from 'os'
import trxParser from '../../src/parsers/trx'
var path = require('path')

test('parse all Results', async () => {
  var testPath = path.join('__tests__', 'trx', '*-results.trx')

  var results = await new trxParser().readResults(testPath)

  expect(results.annotations).toHaveLength(1)
})

test('parse Results', async () => {
  var testPath = path.join('__tests__', 'trx', 'testfailure-results.trx')
  const data = await fs.readFile(testPath, 'utf8')

  const parser = new trxParser()
  const results = await parser['parseResults'](data)

  expect(results.resultCounts.passed).toBe(1)
  expect(results.resultCounts.failed).toBe(1)
  expect(results.totalduration).toBe(779)

  const annotation = results.annotations[0]
  expect(annotation.path).toContain('c:/code/XUnitTestProject1/UnitTest1.cs')

  expect(annotation.start_line).toBe(12)
  expect(annotation.end_line).toBe(12)
  expect(annotation.title).toBe(
    'Failed test XUnitTestProject1.UnitTest1.IsTrue'
  )
  expect(annotation.annotation_level).toBe('failure')
  expect(annotation.message).toBe(
    `Assert.True() Failure\r${EOL}Expected: True\r${EOL}Actual:   False`
  )
})
