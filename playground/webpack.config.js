const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');

function resolve(dir) {
    return path.join(__dirname, '..', dir);
}
module.exports = {
    mode: 'development',
    entry: {
        app: './src/index.tsx',
        "editor.worker": 'monaco-editor-core/esm/vs/editor/editor.worker.js',
        "tbexpLangWorker": "@toy-box/formula-editor/lib/tbexp-lang/tbexp.worker.js",
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
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.css']
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
                test: /\.css/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new htmlWebpackPlugin({
            template: './src/index.html'
        })
    ]
}