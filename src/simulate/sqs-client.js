import { SQSClient } from '@aws-sdk/client-sqs'
import environments from '../constants/environments.js'
import { config } from '../config.js'

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

export { sqsClient }
