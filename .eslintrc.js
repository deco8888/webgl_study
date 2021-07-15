module.exports = {
    root: true, /// .eslintrc.jsがプロジェクトのルートに配置させているか
    env: {
        browser: true, // ブラウザで実行されるコードを検証
        es6: true, // ES6で書かれたコードを検証
    },
    parser: '@typescript-eslint/parser', // ESLintにTypeScriptを理解させる
    parserOptions: {
        sourceType: 'module', // ES Modules機能を有効
        ecmaVersion: 2015, // ECMAScript 2015
        project: './tsconfig.json',
    },
    extends: [
        'plugin:prettier/recommended',
        'prettier',
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended', // eslint:recommendedに含まれるルールを型チェックでカバーできるものは無効化
        'plugin:@typescript-eslint/recommended', // 型チェックが不要なルールを適用
    ],
};
