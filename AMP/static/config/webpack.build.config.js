import path from 'path';

import webpack from 'webpack';
import merge from 'webpack-merge';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

import baseConfig from './base.config.js';
import { cssExtractLoaders } from '../support/utils.js';
import FormatHtmlPlugin from '../support/formatHtml.js';
import baseWebpackConfig from './webpack.base.config.js';

let webpackConfig = {};

webpackConfig = merge(baseWebpackConfig, {
	vue: {
		loaders: cssExtractLoaders({
			extract: true
		})
	},
	output: {
		path: baseConfig.build.staticRoot,
		filename: 'dist/js/[name].[chunkhash].js',
		chunkFilename: 'dist/js/[id].[chunkhash].js'
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		}),
		new webpack.optimize.OccurenceOrderPlugin(),
		new ExtractTextPlugin('dist/css/[name].[contenthash].css'),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
			minChunks: (module, count) => {
				return (
					module.resource && /\.js$/.test(module.resource) && module.resource.indexOf(path.join(__dirname, '../../node_modules')) === 0
				);
			}
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: 'manifest',
			chunks: ['vendor']
		}),
		new HtmlWebpackPlugin({
			filename: path.join(baseConfig.build.viewFolder, './index.production.html'),
			template: path.join(baseConfig.build.viewFolder, './index.html'),
			inject: true,
			favicon: path.join(__dirname, '../src/img/favico.ico'),
			chunksSortMode: 'dependency',
			minify: {
				removeComments: true
			}
		}),
		new FormatHtmlPlugin()
	]
});

export default webpackConfig;
