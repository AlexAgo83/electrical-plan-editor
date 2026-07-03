import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tseslint.config(
  {
    ignores: ["dist", "coverage", "node_modules", "playwright-report", "test-results"]
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "warn",
      "no-restricted-imports": [
        "error",
        { paths: [{ name: "exceljs", allowTypeImports: true, message: "Use the lazy tabular export adapter." }] }
      ],
      "no-restricted-syntax": [
        "error",
        { selector: "ImportExpression[source.value='exceljs']", message: "Import exceljs only from tabularExport.ts." }
      ]
    }
  },
  {
    files: ["src/store/**/*.{ts,tsx}", "src/app/hooks/**/*.{ts,tsx}", "src/app/components/*.{ts,tsx}"],
    rules: {
      "max-lines": ["error", { max: 500, skipBlankLines: false, skipComments: false }]
    }
  },
  {
    files: [
      "src/app/hooks/useNetworkImportExport.ts",
      "src/app/hooks/controller/useAppControllerWorkspaceContentAssembly.tsx",
      "src/app/hooks/useConnectorHandlers.ts",
      "src/app/hooks/useCatalogHandlers.ts"
    ],
    rules: {
      "max-lines": ["error", { max: 750, skipBlankLines: false, skipComments: false }]
    }
  },
  {
    files: ["src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx"],
    rules: { "max-lines": ["error", { max: 1557, skipBlankLines: false, skipComments: false }] }
  },
  {
    files: ["src/app/hooks/controller/useAppControllerNetworkSummaryPanelDomain.tsx"],
    rules: { "max-lines": ["error", { max: 825, skipBlankLines: false, skipComments: false }] }
  },
  {
    files: ["src/app/hooks/controller/useAppControllerScreenContentSlices.tsx"],
    rules: { "max-lines": ["error", { max: 1201, skipBlankLines: false, skipComments: false }] }
  },
  {
    files: ["src/app/hooks/useUiPreferences.ts"],
    rules: { "max-lines": ["error", { max: 920, skipBlankLines: false, skipComments: false }] }
  },
  {
    files: ["src/app/hooks/useWireHandlers.ts"],
    rules: { "max-lines": ["error", { max: 971, skipBlankLines: false, skipComments: false }] }
  },
  {
    files: ["src/app/hooks/validation/buildValidationIssues.ts"],
    rules: { "max-lines": ["error", { max: 869, skipBlankLines: false, skipComments: false }] }
  },
  {
    files: ["src/app/AppController.tsx"],
    rules: {
      "max-lines": ["error", { max: 1100, skipBlankLines: false, skipComments: false }]
    }
  },
  {
    files: ["src/app/components/NetworkSummaryPanel.tsx"],
    rules: {
      "max-lines": ["error", { max: 1020, skipBlankLines: false, skipComments: false }]
    }
  },
  {
    files: ["src/app/lib/tabularExport.ts"],
    rules: {
      "no-restricted-syntax": "off"
    }
  },
  {
    files: ["src/tests/app.ui.*.spec.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.name=/^(it|test)$/][arguments.length>=3]",
          message: "Per-test timeouts require an explicit eslint suppression with a retirement rationale."
        }
      ]
    }
  },
  {
    files: ["src/tests/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  }
);
