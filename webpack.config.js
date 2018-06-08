const webpack = require("webpack");
const path = require('path');
const pkg = require('./package.json');
const buildMode = 'production';

const banner = `
${pkg.name} ${pkg.version}
${pkg.license} Licensed

Copyright (C) ${pkg.author}, ${pkg.homepage}
`

module.exports = {
  mode: buildMode,
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `${pkg.name}.js`
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: banner,
    })
  ],
  externals: {
    'phina.js': 'phina'
  },
};