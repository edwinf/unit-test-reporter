import {parseStringPromise} from 'xml2js'
import {create} from '@actions/glob'
import {promises as fs} from 'fs'
import {Annotation} from '../types/annotation'
import {TestResult} from '../types/test-result'
import {UnitTestResultParser} from './parser'
import {sanitizePath} from './utilities'

export default class TrxParser implements UnitTestResultParser {
    readResults(fileGlob: string): Promise<TestResult> {
        throw new Error('Method not implemented.')
    }
}