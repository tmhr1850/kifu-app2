import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // TypeScript関連のルール
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      
      // Import順序のルール
      "import/order": [
        "error",
        {
          "groups": [
            "builtin",
            "external", 
            "internal",
            ["parent", "sibling"],
            "index"
          ],
          "newlines-between": "always"
        }
      ],
      
      // React関連のルール
      "react/prop-types": "off", // TypeScriptを使うため無効化
      "react-hooks/exhaustive-deps": "warn",
      
      // クリーンアーキテクチャ関連（将来的に追加予定）
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["../../../*"],
              "message": "深すぎるrelative importは禁止です。絶対パスを使用してください。"
            }
          ]
        }
      ]
    }
  }
];

export default eslintConfig;
