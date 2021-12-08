const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');

function resolve(dir) {
    return path.join(__dirname, '..', dir);
}
module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: {
        app: './src/index.tsx',
        "editor.worker": 'monaco-editor/esm/vs/editor/editor.worker.js',
        "tbexpLangWorker": "@toy-box/expression-editor/es/tbexp-lang/TbexpLangWorker.js",
        // "tbexpLangWorker": './src/tbexp-lang/tbexp.worker.ts'
    },
    output: {
        // filename: 'bundle.[hash].js',
        // path: path.resolve(__dirname, 'dist')
        globalObject: 'self',
        filename: (chunkData) => {
            switch (chunkData.chunk.name) {
                case 'editor.worker':
                    return 'editor.worker.js';
                case 'tbexpLangWorker':
                    return "tbexpLangWorker.js";
                default:
                    return 'bundle.[hash].js';
            }
        },
        path: path.resolve(__dirname, 'dist')
    },
    node: {
        fs: 'empty',
        child_process: 'empty',
        net: 'empty',
        crypto: 'empty',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
        alias: {
            vscode: 'monaco-languageclient/lib/vscode-compatibility',
        },
    },
    module: {
        // rules: [
        //     {
        //         test: /.tsx?/,
        //         loader: 'ts-loader'
        //     }
        // ]
        rules: [
            {
                test: /\.tsx?/,
                loader: 'ts-loader'
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
            },
            {
                test: /\.css/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new htmlWebpackPlugin({
            template: './src/index.html'
        }),
        new webpack.IgnorePlugin(
        /^((fs)|(path)|(os)|(crypto)|(source-map-support))$/,
        /vs(\/|\\)language(\/|\\)typescript(\/|\\)lib/,
        ),
    ]
}