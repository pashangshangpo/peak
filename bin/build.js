const Fs = require('fs')
const Path = require('path')
const Webpack = require('webpack')

const GetAssets = stats => {
  let res = {}
  let assets = stats.toJson({
    all: false,
    assets: true
  }).assets

  for (let item of assets) {
    let ext = Path.extname(item.name).slice(1)
    
    if (res[ext] == null) {
      res[ext] = []
    }

    res[ext].push(item.name)
  }

  return res
}

const ReplaceTemplate = (assets, template, injectScript) => {
  let temp = template

  if (assets.css) {
    temp = temp.replace(
      '<!-- inject style -->',
      `
        ${assets.css.map(path => {
          return `<link href="/${path}" rel="stylesheet">`
        }).join('')}
      `
    )
  }

  temp = temp.replace(
    '<!-- inject script -->',
    `
      ${injectScript}
      ${assets.js.map(path => {
        return `<script src="/${path}"></script>`
      }).join('')}
    `
  )

  return temp
}

module.exports = config => {
  console.log('请稍等，正在编译中...')

  Webpack(config.webpackConfigProd, (err, stats) => {
    if (err) {
      throw new Error(err)
    }
    else {
      let template = ReplaceTemplate(
        GetAssets(stats),
        config.template,
        config.injectScript
      )

      Fs.writeFileSync(
        Path.join(config.webpackConfigProd.output.path, config.templateName),
        template
      )
      
      console.log(stats.toString({
        all: false,
        assets: true,
        colors: true
      }))

      console.log('编译完成')
    }
  })
}