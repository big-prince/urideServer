module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true
  },
  extends: 'standard',
  overrides: [
    {
      env: {
        node: true
      },
      files: [
        '.eslintrc.{js,cjs}'
      ],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    "no-restricted-imports": ["error", "underscore"],
    "no-restricted-modules": ["error", "underscore"],
    "promise/catch-or-return": "error",
    "eqeqeq": "error",
    "strict": ["error", "global"],
    // "no-console": "off",
    "consistent-return": "error",
    "no-unused-vars": "off",
    "indent": ["error", 4],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "double"],
    "semi": ["error", "always"]
  }
}
