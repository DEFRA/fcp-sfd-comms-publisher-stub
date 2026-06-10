import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest'

vi.mock('../../../src/config.js', () => ({
  config: {
    get: vi.fn((key) => {
      const values = {
        'aws.endpoint': 'mock-endpoint',
        'aws.region': 'mock-region',
        'aws.accessKeyId': 'mock-access-key',
        'aws.secretAccessKey': 'mock-secret-key'
      }
      return values[key]
    })
  }
}))

let SQSClientArgs
const SQSClientMock = vi.fn(function (args) {
  SQSClientArgs = args
  return { config: args }
})

vi.mock('@aws-sdk/client-sqs', () => {
  return {
    SQSClient: SQSClientMock
  }
})

const OLD_ENV = process.env

describe('sqs-client config', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env = { ...OLD_ENV }
    SQSClientArgs = undefined
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  test('adds credentials when not in production', async () => {
    process.env.NODE_ENV = 'development'
    await import('../../../src/simulate/sqs-client.js')
    expect(SQSClientArgs.credentials).toEqual({
      accessKeyId: 'mock-access-key',
      secretAccessKey: 'mock-secret-key'
    })
  })

  test('does not add credentials in production', async () => {
    process.env.NODE_ENV = 'production'
    await import('../../../src/simulate/sqs-client.js')
    expect(SQSClientArgs.credentials).toBeUndefined()
  })
})
