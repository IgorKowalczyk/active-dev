import eslintConfig from "@igorkowalczyk/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig([
 // prettier
 eslintConfig.base,
 eslintConfig.node,
 eslintConfig.typescript,
 eslintConfig.prettier,
]);
