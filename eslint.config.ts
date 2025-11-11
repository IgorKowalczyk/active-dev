import baseConfig from "@igorkowalczyk/eslint-config/base";
import nodeConfig from "@igorkowalczyk/eslint-config/node";
import prettierConfig from "@igorkowalczyk/eslint-config/prettier";
import typescriptConfig from "@igorkowalczyk/eslint-config/typescript";
import { defineConfig } from "eslint/config";

export default defineConfig(
  // prettier
  baseConfig,
  nodeConfig,
  typescriptConfig,
  prettierConfig
);
