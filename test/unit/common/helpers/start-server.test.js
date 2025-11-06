import { vi, describe, beforeAll, afterAll, test, expect } from 'vitest'
import hapi from '@hapi/hapi'

const mockLoggerInfo = vi.fn()
const mockLoggerError = vi.fn()

vi.mock('../../../../src/common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: (...args) => mockLoggerInfo(...args),
    error: (...args) => mockLoggerError(...args)
  })
}))

describe('#startServer', () => {
  let createServerSpy
  let hapiServerSpy
  let startServerImport
  let createServerImport

  beforeAll(async () => {
    vi.stubEnv('PORT', '3098')
    createServerImport = await import('../../../../src/server.js')
    startServerImport = await import('../../../../src/common/helpers/start-server.js')

    createServerSpy = vi.spyOn(createServerImport, 'createServer')
    hapiServerSpy = vi.spyOn(hapi, 'server')
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  describe('When server starts', () => {
    test('Should start up server as expected', async () => {
      await startServerImport.startServer()

      expect(createServerSpy).toHaveBeenCalled()
      expect(hapiServerSpy).toHaveBeenCalled()
    })
  })

  describe('When server start fails', () => {
    beforeAll(() => {
      createServerSpy.mockRejectedValue(new Error('Server failed to start'))
    })

    test('should log failed startup message', async () => {
      await startServerImport.startServer()

      expect(mockLoggerInfo).toHaveBeenCalledWith('Server failed to start')
      expect(mockLoggerError).toHaveBeenCalledWith(
        new Error('Server failed to start')
      )
    })
  })
})
