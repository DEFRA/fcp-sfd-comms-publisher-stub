import { constants as httpConstants } from 'node:http2'
import { describe, test, beforeEach, afterEach, vi, expect } from 'vitest'

const { HTTP_STATUS_ACCEPTED } = httpConstants

vi.mock('../../../../src/simulate/messages.js', () => ({
  simulateMessages: vi.fn(() => Promise.resolve({ count: 1 }))
}))

vi.mock('../../../../src/common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn()
  })
}))

const { simulateMessages } = await import('../../../../src/simulate/messages.js')
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
      url: '/api/v1/simulate/messages?scenario=TEST&repetitions=3'
    }

    const response = await server.inject(options)

    expect(response.statusCode).toBe(HTTP_STATUS_ACCEPTED)
  })

  test('POST /api/v1/simulate/messages should return expected payload', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/simulate/messages'
    })

    const payload = JSON.parse(response.payload)
    expect(payload).toEqual({
      status: 'ok',
      message: 'Simulation started'
    })
  })

  test('should call simulateMessages with provided query parameters', async () => {
    const scenario = 'TEST123'
    const repetitions = 5

    await server.inject({
      method: 'POST',
      url: `/api/v1/simulate/messages?scenario=${scenario}&repetitions=${repetitions}`
    })

    expect(simulateMessages).toHaveBeenCalledWith({ scenario, repetitions })
  })

  test('should call simulateMessages with defaults if no query parameters', async () => {
    await server.inject({
      method: 'POST',
      url: '/api/v1/simulate/messages'
    })

    expect(simulateMessages).toHaveBeenCalledWith({ scenario: undefined, repetitions: 1 })
  })
})
