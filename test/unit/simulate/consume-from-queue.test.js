import { vi, describe, test, expect, beforeEach, afterAll } from 'vitest'
import * as sqsConsumer from 'sqs-consumer'

import { createLogger } from '../../../src/common/helpers/logging/logger.js'
import { startSqsConsumer, stopSqsConsumer } from '../../../src/simulate/consume-from-queue.js'

vi.mock('../../../src/common/helpers/logging/logger.js', () => ({
  createLogger: vi.fn().mockReturnValue({
    info: vi.fn(),
    error: vi.fn()
  })
}))

let mockConsumer

const consumerSpy = vi.spyOn(sqsConsumer.Consumer, 'create').mockImplementation((config) => {
  mockConsumer = new sqsConsumer.Consumer(config)
  mockConsumer.start = vi.fn()
  mockConsumer.stop = vi.fn()

  return mockConsumer
})

const mockLogger = createLogger()

describe('comms request sqs consumer', () => {
  test('should start the consumer', () => {
    startSqsConsumer({})
    expect(mockConsumer.start).toHaveBeenCalled()
  })

  test('should stop the consumer', () => {
    stopSqsConsumer()

    expect(mockConsumer.stop).toHaveBeenCalled()
  })

  describe('event listeners', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    test('should log consumer start', () => {
      mockConsumer.emit('started')

      expect(mockLogger.info).toHaveBeenCalledWith('SQS consumer started')
    })

    test('should log consumer stop', () => {
      mockConsumer.emit('stopped')

      expect(mockLogger.info).toHaveBeenCalledWith('SQS consumer stopped')
    })

    test('should log consumer error', () => {
      const mockError = new Error('Consumer error')

      mockConsumer.emit('error', mockError)

      expect(mockLogger.error).toHaveBeenCalledWith(
        mockError,
        'Unhandled SQS error in SQS consumer'
      )
    })

    test('should log consumer processing_error', () => {
      const mockError = new Error('Consumer error')

      mockConsumer.emit('processing_error', mockError)

      expect(mockLogger.error).toHaveBeenCalledWith(
        mockError,
        'Unhandled error during SQS consumer processing'
      )
    })

    test('should log consumer timeout_error', () => {
      const mockError = new Error('Consumer error')

      mockConsumer.emit('timeout_error', mockError)

      expect(mockLogger.error).toHaveBeenCalledWith(
        mockError,
        'SQS consumer processing has reached configured timeout'
      )
    })
  })

  afterAll(() => {
    consumerSpy.mockRestore()
  })
})
