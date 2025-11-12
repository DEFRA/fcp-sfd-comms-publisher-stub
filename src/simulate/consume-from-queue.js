import { Consumer } from 'sqs-consumer'
import { SQSClient } from '@aws-sdk/client-sqs'

import { createLogger } from '../common/helpers/logging/logger.js'
import { config } from '../config.js'
import environments from '../constants/environments.js'


const logger = createLogger()

let sqsConsumer

const sqsConfig = {
  endpoint: config.get('aws.endpoint'),
  region: config.get('aws.region')
}

if (process.env.NODE_ENV !== environments.PRODUCTION) {
  sqsConfig.credentials = {
    accessKeyId: config.get('aws.accessKeyId'),
    secretAccessKey: config.get('aws.secretAccessKey')
  }
}

const sqsClient = new SQSClient(sqsConfig)

const startSqsConsumer = () => {
  sqsConsumer = Consumer.create({
    queueUrl: config.get('aws.sqs.queueUrl'),
    batchSize: config.get('aws.sqs.batchSize'),
    waitTimeSeconds: config.get('aws.sqs.waitTimeSeconds'),
    pollingWaitTime: config.get('aws.sqs.pollingWaitTime'),
    handleMessageBatch: async (batch) => { }, // consume the messages to avoid build up on the queue 
    sqs: sqsClient
  })

  sqsConsumer.on('started', () => {
    logger.info('SQS consumer started')
  })

  sqsConsumer.on('stopped', () => {
    logger.info('SQS consumer stopped')
  })

  sqsConsumer.on('error', (error) => {
    logger.error(error, 'Unhandled SQS error in SQS consumer')
  })

  sqsConsumer.on('processing_error', (error) => {
    logger.error(error, 'Unhandled error during SQS consumer processing')
  })

  sqsConsumer.on('timeout_error', (error) => {
    logger.error(error, 'SQS consumer processing has reached configured timeout')
  })

  sqsConsumer.start()
}

const stopSqsConsumer = () => {
  sqsConsumer.stop()
}

export { startSqsConsumer, stopSqsConsumer }
