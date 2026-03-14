import nextConfig from "eslint-config-next";

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...nextConfig,
  {
    rules: {
      // Allow array-index keys in JSX (common pattern when no stable id is available)
      "react/no-array-index-key": "off",
    },
  },
];

export default config;
