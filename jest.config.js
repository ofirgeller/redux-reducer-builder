module.exports = {
  bail: true,
  verbose: true,
  preset: 'ts-jest/presets/js-with-ts', //ts-jest/presets/js-with-ts
  testEnvironment: 'jsdom', // default:jsdom
  modulePaths: [
    "<rootDir>/src/"
  ],
  testRegex: "__tests__/.*.specs\\.(ts|tsx)$",  
  setupFiles: [
    "./__tests__/setup.ts"
  ],
  moduleNameMapper: {
    // use lodash (not lodash-es) for tests, getting around es modules import not being valid syntex:
    //https://medium.com/@martin_hotell/tree-shake-lodash-with-webpack-jest-and-typescript-2734fa13b5cd  (read last article update) 
    '^lodash-es$': '<rootDir>/node_modules/lodash/index.js'
  }
};