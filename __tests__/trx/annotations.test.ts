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
  
    const nunit = new trxParser()
    const results = await trxParser['parseTrx'](data)
  
    expect(results.passed).toBe(1)
    expect(results.failed).toBe(1)
    expect(results.totalduration).toBe(.003)

    const annotation = results.annotations[0]
    var expectedPath = path.join(
      'code',
      'XUnitTestProject1',
      'UnitTest1.cs'
    )
    expect(annotation.path).toContain(expectedPath)
  
    expect(annotation.start_line).toBe(12)
    expect(annotation.end_line).toBe(12)
    expect(annotation.title).toBe(
      'Failed test IsTrue in XUnitTestProject1.UnitTest1'
    )
    expect(annotation.message).toBe(`Assert.True() Failure${EOL}
Expected: True${EOL}
Actual:   False`)
    expect(annotation.annotation_level).toBe('failure')
  })