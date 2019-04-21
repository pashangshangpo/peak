const QiniuPlugin = require('qn-webpack')

module.exports = (webpackConfig, option) => {
  const UploadFileToCDN = option.uploadFileToCDN

  if (UploadFileToCDN) {
    const Config = UploadFileToCDN.config

    if (UploadFileToCDN.cdn === 'qiniu') {
      if (Config && Config.publicPath && Config.publicPath !== '/') {
        webpackConfig.output.publicPath = Config.publicPath
      }

      webpackConfig.plugins.push(
        new QiniuPlugin({
          path: '',
          ...Config,
        })
      )
    }
  }
}
