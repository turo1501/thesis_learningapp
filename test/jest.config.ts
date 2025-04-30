import type { Config } from 'jest';

// This configuration calls the detailed configuration in config/jest.config.ts
// It's a convenience file for running tests from the CLI more easily
const config: Config = {
  // Simply import and re-export the main configuration
  ...require('./config/jest.config')
};

export default config;
