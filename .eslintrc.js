module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        'plugin:vue/vue3-essential',
        'plugin:vue/essential',
        '@vue/standard',
        '@vue/typescript/recommended'
    ],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        "vue/this-in-template": ["error", "never"],
        indent: ['warn', 4],
        "vue/script-indent": ["warn", 4, {
            baseIndent: 1,
            switchCase: 0,
            ignores: []
        }],
        quotes: 'off',
        'no-throw-literal': 'off',
        'vue/no-v-for-template-key-on-child': 'off',
        'vue/no-v-for-template-key': 'off',
        semi: 'warn',
        // 'no-explicit-any': 'on',
        "@typescript-eslint/ban-types": "warn",
        "no-constant-condition": "warn",
        "@typescript-eslint/no-explicit-any": "warn",
        '@typescript-eslint/ban-ts-comment': 'warn',
        '@typescript-eslint/no-empty-function': 'warn',
        'vue/no-v-model-argument': 'off',
        'import/no-duplicates': 'warn',
        'no-trailing-spaces': 'warn',
        camelcase: 'warn',
        'object-curly-spacing': 'warn',
        'spaced-comment': 'warn',
        'vue/no-unused-vars': 'warn',
        'quote-props': 'warn',
        'no-prototype-builtins': 'warn',
        'vue/no-unused-components': 'warn',
        'vue/html-indent': ['warn', 4],
        'comma-dangle': 'off',
        'vue/html-self-closing': 'off',
        'vue/custom-event-name-casing': 'off',
        'vue/singleline-html-element-content-newline': 'off',
        'vue/attributes-order': 'off',
        'vue/order-in-components': 'off',
        'space-before-function-paren': 'off',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/no-var-requires': 'warn',
        'no-multiple-empty-lines': 'warn',
        'eqeqeq': 'warn',
        'no-cond-assign': 'off',
        'no-useless-escape': 'off',
        'no-useless-return': 'off',
        'no-debugger': 'off',
        'no-unused-expressions': 'off',
        "vue/max-attributes-per-line": ["warn", {
            "singleline": {
              "max": 3
            },      
            "multiline": {
              "max": 1
            }
          }],
    },
    overrides: [
        {
            files: [
                '**/__tests__/*.{j,t}s?(x)',
                '**/tests/unit/**/*.spec.{j,t}s?(x)'
            ],
            env: {
                jest: true
            }
        },
        {
            files: ["*.vue"],
            rules: {
                indent: "off"
            }
        }
    ]
}
