import crypto from 'node:crypto'
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'
import { config } from '../config.js'
import { getScenario, listScenarios } from './scenarios.js'

const { sns, region, endpoint, accessKeyId, secretAccessKey } = config.get('aws')

const snsClient = new SNSClient({
  region,
  ...(endpoint && {
    endpoint,
    credentials: { accessKeyId, secretAccessKey }
  })
})

export async function sendToTopic (messageBody) {
  await snsClient.send(
    new PublishCommand({
      Message: JSON.stringify(messageBody),
      TopicArn: sns.topicArn
    })
  )
}

