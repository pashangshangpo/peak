const Fs = require('fs')
const Webpack = require('webpack')
const Express = require('express')
const WebpackDevMiddleware = require('webpack-dev-middleware')
const WebpackHotMiddleware = require('webpack-hot-middleware')

const { ResolveBin } = require('./util')

module.exports = config => {
  const App = new Express()

  Object.keys(config.webpackConfigDev.entry).forEach(key => {
    config.webpackConfigDev.entry[key] = [
      'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=2000&reload=true&noInfo=true',
      ResolveBin('dev-client')
    ].concat(config.webpackConfigDev.entry[key])
  })

  const WebpackCompiler = Webpack(config.webpackConfigDev)
  
  const DevMiddleware = WebpackDevMiddleware(WebpackCompiler, {
    stats: 'none'
  })

  const HotMiddleware = WebpackHotMiddleware(WebpackCompiler, {
    log: false
  })

  App
  .use((req, res, next) => {
    let url = req.url.slice(1)

    if (url === '') {
      url = 'index.html'
    }

    if (url === config.templateName) {
      res.end(
        Fs.readFileSync(`${config.webpackConfigDev.output.path}/${url}`).toString()
      )
    }
    else {
      next()
    }
  })
  .use(DevMiddleware)
  .use(HotMiddleware)
  .listen(8087, err => {
    if (err) {
      throw new Error(err)
    }
  })
}