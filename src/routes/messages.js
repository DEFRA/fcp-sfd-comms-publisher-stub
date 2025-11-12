import { constants as httpConstants } from 'node:http2'
import Joi from 'joi'
import { createLogger } from '../common/helpers/logging/logger.js'
import { sendToTopic } from '../simulate/send-to-topic.js'

const { HTTP_STATUS_ACCEPTED, HTTP_STATUS_INTERNAL_SERVER_ERROR } = httpConstants

const logger = createLogger()

const messages = {
  method: 'POST',
  path: '/api/v1/simulate/messages',
  options: {
    description: 'Simulate messages from SFD consumers',
    notes: 'Scenario and number of repetitions can be specified',
    tags: ['api', 'simulate', 'messages']
  },
  handler: async (request, h) => {
    const { payload } = request
    try {
      await sendToTopic(payload)
      logger.info(`Message sent to topic, id: ${payload.id}`)
      return h.response({ status: 'ok', message: 'Message request processed.' }).code(HTTP_STATUS_ACCEPTED)
    } catch(err) {
      logger.error(`Message failed to send, id: ${payload.id}. ${err.message}` )
      return h.response({status: 500, message: 'Failed to process message.'}).code(HTTP_STATUS_INTERNAL_SERVER_ERROR)
    }
  }
}

export { messages }
