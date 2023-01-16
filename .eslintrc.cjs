module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'plugin:react/recommended'
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
      jsx: true
    }
  },
  plugins: [
    'react'
  ],
  // off 0 | warn 1 | error 2
  rules: {
    // 'comma-dangle': ['error', 'never'],
    'no-var': 'error',
    'indent': ['error', 2],
    'no-mixed-spaces-and-tabs': 'error',
    // 'quotes': ['error', 'single'],
    'no-multiple-empty-lines': ['error', { max: 1 }],
    "react/prop-types": [2, { ignore: ['children'] }]
  }
}
