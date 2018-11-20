const Webpack = require('webpack')
const Express = require('express')
const WebpackDevMiddleware = require('webpack-dev-middleware')
const WebpackHotMiddleware = require('webpack-hot-middleware')

const { ResolveBin, GetRandomPort, GetIp } = require('./util')

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

  GetRandomPort(port => {
    App
    .use((req, res, next) => {
      let url = req.url.slice(1)

      if (url === '') {
        url = 'index.html'
      }

      if (url === config.templateName) {
        let template = config.template
        template = template.replace('<!-- inject script -->', '<script src="index.js"></script>')

        res.end(template)
      }
      else {
        next()
      }
    })
    .use(DevMiddleware)
    .use(HotMiddleware)
    .listen(port, err => {
      if (err) {
        throw new Error(err)
      }
      else {
        console.log(`http://${GetIp()}:${port}`)
      }
    })
  })
}