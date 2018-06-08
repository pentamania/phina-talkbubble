const webpack = require("webpack");
const path = require('path');
const pkg = require('./package.json');

const banner = `
${pkg.name} ${pkg.version}
${pkg.license} Licensed

Copyright (C) ${pkg.author}, ${pkg.homepage}
`;

const isProduction = (process.env.NODE_ENV != null && process.env.NODE_ENV.trim() === "production");
const buildMode = (isProduction) ? 'production': 'development';
const filename = (isProduction) ? `${pkg.name}.min.js` : `${pkg.name}.js`;

module.exports = {
  mode: buildMode,
  // watch: !isProduction,
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: filename,
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