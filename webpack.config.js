const path = require('path');

module.exports = {
  entry: './index.js',
  output: {
    filename: 'json-editor.js',
    path: path.resolve(__dirname, 'tests'),
  },
  devServer: {
    contentBase: path.join(__dirname, 'tests'),
    compress: true,
    port: 9000
  }
}
