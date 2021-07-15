const path = require('path');
const webpack = require('webpack');
const glob = require('glob');

// cssファイルを個別のファイルに抽出　！style-loaderと一緒に使用しない
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// CSSを最小化する
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

// terserを使用してJSを縮小
const TerserPlugin = require('terser-webpack-plugin');

// Babelの機能のminifyを利用するため
const BabelMinifyPlugin = require('babel-minify-webpack-plugin');

// buildフォルダをクリーンアップさせる
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// webpackで生成したJSやCSSを埋め込んだHTMLを生成する
const HtmlWebpackPlugin = require('html-webpack-plugin');

// ファイルをコピーする
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development' ? true : false;

// 付与するキャッシュパラメータ
const cacheParam = new Date().getTime().toString(16) + Math.floor(1000 * Math.random()).toString(16);

const src = path.resolve(__dirname, './src'); // source files
const build = path.resolve(__dirname, './dist'); // production build files

const pathList = glob
    .sync('**/*.js', {
        ignore: '**/_*.js',
        cwd: path.resolve(__dirname, './src/assets/scripts/pages/'),
    })
    .map((jsPath) => {
        return [
            path.basename(jsPath, path.extname(jsPath)),
            path.resolve(__dirname, 'src/assets/scripts/pages/' + jsPath + ''),
        ];
    });
const entries = Object.fromEntries(pathList);

const htmlList = glob
    .sync('**/*.html', {
        cwd: path.resolve(__dirname, './src/pages/'),
    })
    .map((htmlPath) => {
        console.log(path.dirname(htmlPath));
        return [path.dirname(htmlPath), htmlPath];
    });

const webpackConfig = {
    context: path.resolve(__dirname, 'src/assets'),
    mode: 'development',
    // メインのJavaScript file（entry point）
    entry: entries,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'assets/scripts/[name].bundle.js?[chunkhash]',
    },
    // ローカルサーバー
    devServer: {
        contentBase: path.resolve(__dirname, 'src'),
        hot: true,
        inline: true,
        // contentBaseオプションによって提供されるファイルを監視
        watchContentBase: true,
        port: 3000,
        historyApiFallback: true,
    },
    // デフォルトの最適化を上書き（変更）
    optimization: {
        // デフォルトの圧縮方法を変更
        minimizer: [
            // JS用のminifyプラグイン
            new TerserPlugin({
                // 複数スレッドでビルドすることで高速化
                parallel: true,
                // コメントを除くかどうか
                extractComments: false,
            }),
            // CSS用のminifyプラグイン
            new OptimizeCSSAssetsPlugin({}),
        ],
        // 複数のエントリーポイント間で利用している共通モジュールをバンドルしたファイルを出力するための設定
        splitChunks: {
            name: 'vendor',
            chunks: 'initial',
        },
    },
    stats: {
        children: false,
    },
    // モジュール解決の設定を変更
    resolve: {
        modules: [`${__dirname}/src`, 'node_modules'],
        // importの際に拡張子を省略することができる
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },
    // ローダーの設定
    module: {
        rules: [
            {
                test: /\.(js|ts|tsx)$/,
                exclude: /node_modules/,
                use: [
                    {
                        // Babelを利用
                        loader: 'babel-loader',
                        // Babelのオプションを指定
                        options: {
                            presets: [
                                [
                                    // プリセットを指定し、ES2020をES5に変換
                                    '@babel/preset-env',
                                    {
                                        targets: {
                                            ie: 11,
                                            esmodules: true,
                                        },
                                        // 必要なpolyfillのみ入れる
                                        useBuiltIns: 'usage',
                                        // polyfillを利用するcore-jsのバージョンを指定
                                        corejs: 3.8,
                                    },
                                ],
                            ],
                            // IEでTemplate Literal(`${}`)が使用できる
                            plugins: ['@babel/plugin-transform-template-literals'],
                        },
                    },
                ],
            },
            {
                test: /\.(js|ts|tsx)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
            {
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /node_modules/,
                use: [
                    'raw-loader',
                    'glslify-loader'
                ],
            },
            {
                test: /\.(sc|c|sa)ss$/,
                use: [
                    // 4. cssをjsファイルと別々に生成
                    MiniCssExtractPlugin.loader,
                    {
                        // 3. Cssの依存関係を解決
                        loader: 'css-loader',
                        options: {
                            sourceMap: isDev,
                        },
                    },
                    {
                        // 2. PostCSS（autoprefixer）の設定
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: isDev,
                        },
                    },
                    {
                        // 1. sassをcssにコンパイル
                        loader: 'sass-loader',
                        options: {
                            sourceMap: isDev,
                        },
                    },
                    {
                        loader: 'import-glob-loader',
                    },
                ],
            },
            // stylesheetで読み込んでいる画像を出力フォルダにコピー
            {
                test: /\.(gif|png|jpe?g|svg|eot|wof|woff|woff2|ttf)$/i,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]',
                    outputPath: 'assets/',
                    publicPath: (path) => {
                        return '../' + path;
                    },
                },
            },
        ],
    },
    plugins: [
        // cssファイルを外だしにする
        new MiniCssExtractPlugin({
            filename: 'assets/styles/[name].css?[chunkhash]',
        }),

        // Babelの機能のminifyを利用するため
        new BabelMinifyPlugin(),

        // buildフォルダをクリーンアップ
        new CleanWebpackPlugin({
            cleanStaleWebpackAssets: false,
        }),

        // Promiseを使用する(IE対策)
        new webpack.ProvidePlugin({
            Promise: 'es6-promise',
        }),

        // 環境変数をモジュールに渡す
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        }),
    ],
};

htmlList.forEach((item) => {
    webpackConfig.plugins.push(
        new HtmlWebpackPlugin({
            inject: 'head',
            scriptLoading: 'defer',
            cacheParam: '?ver=' + cacheParam,
            template: path.resolve(__dirname, `./src/pages/${item[1]}`),
            filename: item[1],
            chunks: [item[0], 'common'],
            minify: false,
        })
    );
});

module.exports = webpackConfig;
