const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const find = require('find')

const args = require('minimist')(process.argv.slice(2))
const extractCSS = new ExtractTextPlugin('[name].css')

let config
if (args.env === 'lib') {
    config = {
        entry: {
            Scrollload: './src/Scrollload.js'
        },
        output: {
            path: './lib',
            filename: '[name].js',
            library: 'Scrollload.js',
            libraryTarget: 'umd'
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: [
                        {
                            loader: 'babel-loader',
                        }
                    ],
                    include: [
                        path.resolve(__dirname, 'src'),
                        path.resolve(__dirname, 'node_modules/localscrollfix'),
                    ],
                }
            ],
        }
    }
} else {
    config = {
        entry: {},
        output: {
            path: './dist',
            filename: '[name].js'
        },
        devtool: args.env === 'dist' ? '' : 'eval-source-map',
        module: {
            rules: [
                {
                    test: /\.css$/,
                    loader: extractCSS.extract({
                        fallbackLoader: "style-loader",
                        loader: [
                            {
                                loader: 'css-loader',
                                query: {
                                    minimize: true
                                }
                            },
                            {
                                loader: 'postcss-loader'
                            }
                        ]
                    }),
                },
                {
                    test: /\.js$/,
                    use: [
                        {
                            loader: 'babel-loader',
                        }
                    ],
                    include: [
                        path.resolve(__dirname, 'src'),
                        path.resolve(__dirname, 'node_modules/localscrollfix'),
                    ],
                }
            ],
        },
        plugins: [
            new webpack.LoaderOptionsPlugin({
                options: {
                    postcss: function () {
                        return [
                            require('autoprefixer')({
                                browsers: ['> 1%', 'last 3 versions', 'iOS >= 6', 'android 4']
                            })
                        ];
                    },
                }
            }),
            extractCSS
        ],
        devServer: {
            contentBase: './src',
            port: 9000
        },
    }
    const filePaths = find.fileSync('index.js', './src')
    filePaths.forEach((filePath, index) => {
        config.entry[`out${index}`] = `./${filePath}`
        config.plugins.push(new HtmlWebpackPlugin({
            filename: filePath.replace(/js$/, 'html').replace('src/', ''),
            template: filePath.replace(/js$/, 'html'),
            chunks: [`out${index}`]
        }))
    })
}


module.exports = config