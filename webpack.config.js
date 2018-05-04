var path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
	mode: 'development',
	entry: {
		'scene': './jssrc/scene.js',
	},
	output: {
		filename: '[name].min.js',
		path: path.resolve(__dirname, 'js')
	},
	resolve: {
	},
	module: {
	},
	plugins: [
		 new UglifyJSPlugin()
	]
};
