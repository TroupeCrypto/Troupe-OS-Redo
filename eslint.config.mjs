import nextConfig from "eslint-config-next/core-web-vitals";

const config = [
  ...nextConfig,
  {
    ignores: ["**/node_modules/**", ".next/**"],
  },
];

export default config;
