module.exports = {
  extends: [require.resolve('@backstage/cli/config/eslint.backend')],
  rules: {
    "func-names": "off",
    "jest/no-standalone-expect": "off",
  }
};
