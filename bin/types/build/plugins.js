const QiniuPlugin = require('qn-webpack')
const Fs = require('fs')
const Path = require('path')

/**
 * 将依赖的 css 和 js 插入到 html 文件中
 * 
 * css会替换 html 中的<!-- inject style -->
 * js会替换 html 中的<!-- inject script -->
 * 
 * option: Object
 *  templatePath: String
 */
class WebPackHtmlAssets {
  constructor(option = {}) {
    this.templatePath = option.templatePath

    if (!this.templatePath) {
      throw new Error('请传递templatePath模板路径')
    }
  }

  apply(compiler) {
    const HtmlAssets = (compilation, callback) => {
      const Stats = compilation.getStats().toJson({
        publicPath: true,
        hash: false,
        assets: false,
        chunks: false,
        modules: false,
        source: false,
        errorDetails: false,
        timings: false,
        entrypoints: false,
        children: false,
      })

      const PublicPath = Stats.publicPath || ''
      const Result = {}

      for (let name of Object.keys(Stats.namedChunkGroups)) {
        const Assets = Stats.namedChunkGroups[name].assets
        const CurrentPageAssets = Result[name] = {}

        for (let path of Assets) {
          const AbsolutePath = `${PublicPath}/${path}`
          const Ext = path.slice(path.lastIndexOf('.') + 1)
          const Exts = ['js', 'css']
          const CurrentExt = Exts.find(name => name === Ext)

          if (CurrentExt) {
            if (!CurrentPageAssets[CurrentExt]) {
              CurrentPageAssets[CurrentExt] = []
            }

            CurrentPageAssets[CurrentExt].push(AbsolutePath)
          }
        }
      }

      const OutputPath = compiler.options.output.path
      const Template = Fs.readFileSync(this.templatePath).toString()

      for (let name of Object.keys(Result)) {
        const Js = Result[name].js || []
        const Css = Result[name].css || []
        let TempTemplate = Template

        TempTemplate = TempTemplate.replace(
          '<!-- inject style -->',
          Css.map(path => {
            return `<link rel="stylesheet" href="${path}">`
          }).join('')
        )

        TempTemplate = TempTemplate.replace(
          '<!-- inject script -->',
          Js.map(path => {
            return `<script src="${path}"></script>`
          }).join('')
        )

        Fs.writeFileSync(Path.join(OutputPath, name + '.html'), TempTemplate)
      }

      callback()
    }

    if (compiler.hooks) {
      compiler.hooks.afterEmit.tapAsync('HtmlAssets', HtmlAssets)
    }
    else {
      compiler.plugin('after-emit', HtmlAssets)
    }
  }
}

module.exports = (webpackConfig, option) => {
  webpackConfig.plugins.push(new WebPackHtmlAssets({
    templatePath: option.template,
  }))

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
