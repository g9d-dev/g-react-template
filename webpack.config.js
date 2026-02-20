const defaultsDeep = require('lodash.defaultsdeep');
var path = require('path');
var webpack = require('webpack');

// Plugins
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
//var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

// PostCss
var autoprefixer = require('autoprefixer');
var postcssVars = require('postcss-simple-vars');
var postcssImport = require('postcss-import');

const STATIC_PATH = process.env.STATIC_PATH || '/static';

const base = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    devtool: 'cheap-module-source-map',
    devServer: {
        //contentBase: path.resolve(__dirname, 'build'),
        host: '0.0.0.0',
        port: process.env.PORT || 11451
    },
    output: {
        library: 'GUI',
        filename: '[name].js',
        chunkFilename: 'chunks/[name].js',
        publicPath: ''
    },
    resolve: {
        symlinks: false
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            loader: 'babel-loader',
            include: [
                path.resolve(__dirname, 'src'),
                // /node_modules[\\/][^@\.][^\\/]+/,
                /node_modules[\\/]g-[^\\/]+[\\/]src/,
                /node_modules[\\/]react-redux/,
                /node_modules[\\/]redux/,
                /node_modules[\\/]@fortawesome/,
                /node_modules[\\/]pify/,
                /node_modules[\\/]@vernier[\\/]godirect/
            ],
            options: {
                // Explicitly disable babelrc so we don't catch various config
                // in much lower dependencies.
                babelrc: false,
                plugins: [
                    '@babel/plugin-syntax-dynamic-import',
                    '@babel/plugin-transform-async-to-generator',
                    '@babel/plugin-proposal-object-rest-spread',
                ],
                presets: ['@babel/preset-env', '@babel/preset-react']
            }
        },
        {
            test: /\.css$/,
            use: [{
                loader: 'style-loader'
            }, {
                loader: 'css-loader',
                options: {
                    modules: true,
                    importLoaders: 1,
                    //localIdentName: '[name]_[local]_[hash:base64:5]',
                    //camelCase: true
                }
            }, {
                loader: 'postcss-loader',
                options: {
                    postcssOptions: {
                        //ident: 'postcss',
                        plugins: function () {
                            return [
                                postcssImport,
                                postcssVars,
                                autoprefixer
                            ];
                        }
                    }
                }
            }]
        }]
    },
    optimization: {
        minimizer: [
            //new UglifyJsPlugin({
            //    include: /\.min\.js$/
            //})
        ]
    },
    plugins: [new webpack.HotModuleReplacementPlugin()]
};

if (!process.env.CI) {
    base.plugins.push(new webpack.ProgressPlugin());
}
var template = 'src/template.ejs';

module.exports = [
    // to run editor examples
    defaultsDeep({}, base, {
        entry: {
            'lib.min': ['react', 'react-dom'],
            'index': './src/pages/index.jsx',
        },
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: '[name].js'
        },
        module: {
            rules: base.module.rules.concat([
                {
                    test: /\.(svg|png|wav|mp3|gif|jpg)$/,
                    loader: 'file-loader',
                    options: {
                        outputPath: 'static/assets/'
                    }
                }
            ])
        },
        /*
        optimization: {
            splitChunks: {
                chunks: 'all',
                name: 'lib.min'
            },
            //runtimeChunk: {
            //    name: 'lib.min'
            //}
            //dependOn: "lib.min"
        },
        */
        plugins: base.plugins.concat([
            new webpack.DefinePlugin({
                //'process.env.NODE_ENV': '"' + process.env.NODE_ENV + '"',
                //'process.env.DEBUG': Boolean(process.env.DEBUG),
                //'process.env.GA_ID': '"' + (process.env.GA_ID || 'UA-000000-01') + '"'
            }),
            new HtmlWebpackPlugin({
                chunks: ['lib.min', 'index'],
                template: template,
                title: 'React App'
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: 'static',
                        to: 'static'
                    }
                ]
            })
        ])
    })
].concat(
    process.env.NODE_ENV === 'production' || process.env.BUILD_MODE === 'dist' ? (
        // export as library
        defaultsDeep({}, base, {
            target: 'web',
            entry: {
                'g-video': './src/index.js'
            },
            output: {
                libraryTarget: 'umd',
                path: path.resolve('dist'),
                publicPath: `${STATIC_PATH}/`
            },
            externals: {
                'react': 'react',
                'react-dom': 'react-dom'
            },
            module: {
                rules: base.module.rules.concat([
                    {
                        test: /\.(svg|png|wav|mp3|gif|jpg)$/,
                        loader: 'file-loader',
                        options: {
                            outputPath: 'static/assets/',
                            publicPath: `${STATIC_PATH}/assets/`
                        }
                    }
                ])
            },
            plugins: base.plugins.concat([
            ])
        })) : []
);
