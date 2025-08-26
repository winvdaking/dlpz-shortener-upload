import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        React: "readonly",
        document: "readonly",
        window: "readonly",
        console: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // Règles React optimisées
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // Règles de performance
      "no-console": "warn",
      "no-debugger": "error",
      "no-unused-vars": "warn",
      "prefer-const": "error",

      // Règles de style
      indent: ["error", 2],
      quotes: ["error", "single"],
      semi: ["error", "always"],
    },
  },
  {
    files: ["**/*.{js,jsx}"],
    ignores: ["dist/**", "node_modules/**", "*.config.js"],
  },
];
