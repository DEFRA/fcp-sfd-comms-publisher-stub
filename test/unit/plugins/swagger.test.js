import { vi, describe, test, expect } from 'vitest'

vi.mock('@hapi/inert', () => ({ default: Symbol('Inert') }))
vi.mock('@hapi/vision', () => ({ default: Symbol('Vision') }))
vi.mock('hapi-swagger', () => ({ default: Symbol('HapiSwagger') }))

const Inert = (await import('@hapi/inert')).default
const Vision = (await import('@hapi/vision')).default
const HapiSwagger = (await import('hapi-swagger')).default

const { swagger } = await import('../../../src/plugins/swagger.js')

describe('swagger plugin', () => {
  test('should export an array', () => {
    expect(Array.isArray(swagger)).toBe(true)
  })

  test('should include Inert and Vision plugins', () => {
    expect(swagger).toEqual(expect.arrayContaining([Inert, Vision]))
  })

  test('should include HapiSwagger plugin config', () => {
    const swaggerPlugin = swagger.find(p => p.plugin === HapiSwagger)
    expect(swaggerPlugin).toBeDefined()
    expect(swaggerPlugin.options).toMatchObject({
      info: {
        title: 'FCP Single Front Door Comms Publisher Stub'
      }
    })
  })
})
