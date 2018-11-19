const Path = require('path')
const Net = require('net')

const GetRandomPort = (cb, port = 8089) => {
  const Server = Net.createServer().listen(port)
  
  Server.on('listening', () => {
    Server.once('close', () => {
      cb(port)
    })

    Server.close()
  })

  Server.on('error', err => {
    if (err.code === 'EADDRINUSE') {
      GetRandomPort(cb, port + 1)
    }
  })
}

module.exports = {
  ResolveRoot(...arg) {
    return Path.join(process.cwd(), ...arg)
  },
  ResolveBin(...arg) {
    return Path.join(__dirname, ...arg)
  },
  GetRandomPort: GetRandomPort
}