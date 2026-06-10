import { vi, describe, test, expect, beforeEach } from 'vitest'

vi.mock('../../../src/config.js', () => ({
  config: {
    get: vi.fn(() => ({
      sns: { topicArn: 'mock-arn' }
    }))
  }
}))

const sendMock = vi.fn()
const PublishCommandMock = vi.fn(function (input) {
  return { ...input }
})

class SNSClientMock {
  send (...args) { return sendMock(...args) }
}

vi.mock('@aws-sdk/client-sns', async () => {
  return {
    SNSClient: SNSClientMock,
    PublishCommand: PublishCommandMock
  }
})

const { sendToTopic } = await import('../../../src/simulate/send-to-topic.js')

describe('sendToTopic', () => {
  beforeEach(() => {
    sendMock.mockReset()
    PublishCommandMock.mockClear()
  })

  test('should publish the message to the SNS topic', async () => {
    sendMock.mockResolvedValueOnce({ MessageId: 'mock-id' })
    const message = { id: 'test' }

    await sendToTopic(message)

    expect(PublishCommandMock).toHaveBeenCalledWith({
      Message: JSON.stringify(message),
      TopicArn: 'mock-arn'
    })

    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({
      Message: JSON.stringify(message),
      TopicArn: 'mock-arn'
    }))
  })

  test('should throw if SNS publish fails', async () => {
    sendMock.mockRejectedValueOnce(new Error('SNS error'))
    await expect(sendToTopic({ id: 'test' })).rejects.toThrow('SNS error')
  })
})
