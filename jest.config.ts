import type { Config } from 'jest'

const config: Config = {
  verbose: true,
  setupFiles: ['dotenv/config'], // Supports using .env and process.env  for reading environmental variables
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/']
}

export default config
