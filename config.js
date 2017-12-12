var pkg = require('./package.json');

module.exports = {

  outFileName: pkg.name + '.js',

  srcPath: __dirname + "/src",
  outPath: __dirname + "/dist",

  // Following files (in src folder) will be concatenated in listed order
  files: [
    'talkBubbleShape.js',
    'canvasTalkBubble.js',
  ],
};