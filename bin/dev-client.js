const HotClient = require('webpack-hot-middleware/client')

HotClient.subscribe(function (event) {
  if (event.action === 'reload') {
    window.location.reload()
  }
})
