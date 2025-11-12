import process from 'node:process'

import { createLogger } from './common/helpers/logging/logger.js'
import { startServer } from './common/helpers/start-server.js'
import { startSqsConsumer, stopSqsConsumer } from './simulate/consume-from-queue.js'

const logger = createLogger()

const server = await startServer()
await startSqsConsumer()

server.events.on('stop', async () => {
  await stopSqsConsumer()
})

process.on('unhandledRejection', (err) => {
  logger.info('Unhandled rejection')
  logger.error(err)
  process.exitCode = 1
})
