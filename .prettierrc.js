module.exports = {
    printWidth: 120, // 自動折返し文字数
    tabWidth: 4, // インデントレベルごとにタブサイズを指定
    useTabs: false, // タブの代わりにスペースでインデント
    semi: true, // ステートメントの最後にセミコロンを付与
    singleQuote: true, // 二重引用符の代わりに一重引用符を使用
    trailingComma: 'es5', // ES5で有効な末尾のコンマ
    endOfLine: 'auto', // 改行の文字コードを指定（auto:既存の行末を維持)
    overrides: [
        {
            files: ['*.json'],
            options: {
                tabWidth: 2,
            },
        },
    ],
};
