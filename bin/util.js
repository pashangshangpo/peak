const Path = require('path')

module.exports = {
  ResolveRoot(...arg) {
    return Path.join(process.cwd(), ...arg)
  },
  ResolveBin(...arg) {
    return Path.join(__dirname, ...arg)
  }
}