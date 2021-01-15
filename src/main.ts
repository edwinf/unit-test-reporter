import {setFailed, getInput} from '@actions/core'
import nunit from './parsers/nunit'
import {uploadResults} from './github'
import {UnitTestResultParser} from './parsers/parser'

async function run(): Promise<void> {
  try {
    const path = getInput('path')
    const numFailures = parseInt(getInput('numFailures'))
    const accessToken = getInput('access-token')
    const title = getInput('reportTitle')
    const reportType = getInput('reportType')

    let parser: UnitTestResultParser | null = null
    switch (reportType) {
      case 'nunit':
        parser = new nunit()
        break

      default:
        setFailed(
          `Unknown report type ${reportType}.  Types 'nunit' are supported`
        )
        break
    }

    if (parser != null) {
      const results = await parser.readResults(path)
      uploadResults(accessToken, title, numFailures, results)
    }
  } catch (error) {
    setFailed(error.message)
  }
}

run()
