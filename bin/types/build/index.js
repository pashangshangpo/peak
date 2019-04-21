const Webpack = require('webpack')

const Plugins = require('./plugins')

module.exports = (config, option) => {
  console.log('请稍等，正在编译中...')

  Plugins(config.webpackConfigProd, option)

  Webpack(config.webpackConfigProd, (err, stats) => {
    if (err) {
      throw new Error(err)
    }
    else {
      console.log(stats.toString({
        all: false,
        assets: true,
        colors: true,
        errors: true,
        errorDetails: true,
        warnings: true,
      }))

      console.log('编译完成')
    }
  })
}