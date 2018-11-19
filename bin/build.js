const Webpack = require('webpack')

module.exports = config => {
  const WebpackCompiler = Webpack(config.webpackConfigProd, (err, stats => {
    if (err) {
      throw new Error(err)
    }
    else {
      console.log('编译成功')
    }
  }))
}