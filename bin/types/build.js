const Webpack = require('webpack')

module.exports = config => {
  console.log('请稍等，正在编译中...')

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