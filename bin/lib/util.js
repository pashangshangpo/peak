const Path = require('path')
const Net = require('net')
const Os = require('os')

const GetRandomPort = (cb, port = 9000) => {
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
    return Path.join(__dirname, '../', ...arg)
  },
  GetIp() {
    let ipStr = ''
		let	infaces = Os.networkInterfaces()
		let	bool = false

		for (let i in infaces) {
			infaces[i].some(x => {
				if ((x.family === 'IPv4') && (x.internal === false)) {
					ipStr = x.address
          bool = true
          
					return true
				}
			})

			if (bool) {
				break
			}
		}

		return ipStr
  },
  GetRandomPort: GetRandomPort
}