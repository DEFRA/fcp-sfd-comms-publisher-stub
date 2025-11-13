import { Consumer } from 'sqs-consumer'

import { createLogger } from '../common/helpers/logging/logger.js'
import { config } from '../config.js'

const logger = createLogger()

let sqsConsumer

const startSqsConsumer = (sqsClient) => {
  sqsConsumer = Consumer.create({
    queueUrl: config.get('aws.sqs.queueUrl'),
    batchSize: config.get('aws.sqs.batchSize'),
    waitTimeSeconds: config.get('aws.sqs.waitTimeSeconds'),
    pollingWaitTime: config.get('aws.sqs.pollingWaitTime'),
    handleMessageBatch: async () => { }, // consume the messages to avoid build up on the queue
    sqs: sqsClient
  })

  sqsConsumer.on('started', () => {
    console.log('SQS consumer started')
    console.log(sqsClient.testProp)
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
