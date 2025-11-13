import { constants as httpConstants } from 'node:http2'
import { describe, test, beforeEach, afterEach, vi, expect } from 'vitest'

const { HTTP_STATUS_ACCEPTED } = httpConstants

vi.mock('../../../../src/simulate/send-to-topic.js', () => ({
  sendToTopic: vi.fn(() => Promise.resolve({ }))
}))

vi.mock('../../../../src/common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn()
  })
}))

const { sendToTopic } = await import('../../../../src/simulate/send-to-topic.js')
const { createServer } = await import('../../../../src/server.js')

let server

describe('messages routes', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  test('POST /api/v1/simulate/messages should return 202', async () => {
    const options = {
      method: 'POST',
      url: '/api/v1/simulate/messages',
      payload: {
        id: 'test'
      }
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(HTTP_STATUS_ACCEPTED)
  })

  test('POST /api/v1/simulate/messages should return 500 on error', async () => {
    sendToTopic.mockImplementationOnce(() => Promise.reject(new Error('Simulated failure')))

    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/simulate/messages',
      payload: {
        id: 'fail-test'
      }
    })
    expect(response.statusCode).toBe(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
    const payload = JSON.parse(response.payload)
    expect(payload).toEqual({
      status: 'server error',
      message: 'Failed to process message.'
    })
  })

  test('POST /api/v1/simulate/messages should return expected payload', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/simulate/messages',
      payload: {
        id: 'test'
      }
    })

    const payload = JSON.parse(response.payload)
    expect(payload).toEqual({
      status: 'ok',
      message: 'Message request processed.'
    })
  })

  test('should call sendToTopic with provided query parameters', async () => {
    await server.inject({
      method: 'POST',
      url: '/api/v1/simulate/messages',
      payload: {
        id: 'test-id'
      }
    })

    expect(sendToTopic).toHaveBeenCalledWith({ id: 'test-id' })
  })
})
