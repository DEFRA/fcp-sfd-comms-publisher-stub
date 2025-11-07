import { describe, test, expect, vi, beforeEach } from 'vitest'

let snsClientInstance

vi.mock('@aws-sdk/client-sns', () => {
  const sendMock = vi.fn(() => Promise.resolve())

  const SNSClient = vi.fn((config) => {
    snsClientInstance = { config, send: sendMock }
    return snsClientInstance
  })

  const PublishCommand = vi.fn(cmd => cmd)

  return { SNSClient, PublishCommand }
})

vi.mock('../../../src/config.js', () => ({
  config: {
    get: vi.fn(() => ({
      region: 'eu-west-2',
      endpoint: null,
      accessKeyId: 'mock-access-key-id',
      secretAccessKey: 'mock-secret-access-key',
      sns: { topicArn: 'arn:aws:sns:eu-west-2:123456789012:mock-topic' }
    }))
  }
}))

vi.mock('../../../src/simulate/scenarios.js', () => ({
  getScenario: vi.fn(),
  listScenarios: vi.fn()
}))

vi.mock('node:crypto', () => ({
  default: {
    randomUUID: vi.fn(() => 'mock-uuid')
  }
}))

const { getScenario, listScenarios } = await import('../../../src/simulate/scenarios.js')
const { simulateMessages } = await import('../../../src/simulate/messages.js')

describe('Simulate messages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should send SNS messages for a single provided scenario', async () => {
    getScenario.mockReturnValue([{ data: {} }, { data: {} }])

    const result = await simulateMessages({ scenario: 'streams.successful', repetitions: 2 })

    const firstCallArg = snsClientInstance.send.mock.calls[0][0]

    expect(getScenario).toHaveBeenCalledWith('streams.successful')
    expect(listScenarios).not.toHaveBeenCalled()
    expect(snsClientInstance.send).toHaveBeenCalledTimes(4)
    expect(firstCallArg).toHaveProperty('Message')
    expect(JSON.parse(firstCallArg.Message)).toHaveProperty('id', 'mock-uuid')
    expect(firstCallArg).toHaveProperty('TopicArn', 'arn:aws:sns:eu-west-2:123456789012:mock-topic')

    expect(result).toEqual({
      scenarios: 1,
      events: 4,
      repetitions: 2
    })
  })

  test('should send SNS messages for all scenarios when none provided', async () => {
    listScenarios.mockReturnValue([
      { path: 'streams.successful', count: 3 },
      { path: 'streams.failure', count: 2 }
    ])

    getScenario.mockImplementation(path => {
      if (path === 'streams.successful') return [{ data: {} }]
      if (path === 'streams.failure') return [{ data: {} }]
    })

    const result = await simulateMessages({ scenario: undefined, repetitions: 1 })

    expect(snsClientInstance.send).toHaveBeenCalledTimes(2)
    expect(listScenarios).toHaveBeenCalled()
    expect(getScenario).toHaveBeenCalledTimes(2)

    expect(result).toEqual({
      scenarios: 2,
      events: 2,
      repetitions: 1
    })
  })

  test('should attach correlationId, id, and timestamp to each event', async () => {
    const mockEvent = { data: {} }
    getScenario.mockReturnValue([mockEvent])

    await simulateMessages({ scenario: 'test', repetitions: 1 })

    const publishedMessage = JSON.parse(snsClientInstance.send.mock.calls[0][0].Message)

    expect(publishedMessage).toHaveProperty('id', 'mock-uuid')
    expect(publishedMessage).toHaveProperty('time')
    expect(publishedMessage.data).toHaveProperty('correlationId', 'mock-uuid')
  })
})
