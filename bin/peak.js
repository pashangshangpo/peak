#!/usr/bin/env node

const Cli = require('commander')
const Fs = require('fs')
const Path = require('path')

const Server = require('./server')
const Build = require('./build')
const { ResolveRoot } = require('./util')

Cli
	.version('0.0.1')
	.description('前端工程化解决方案')
	.option('-t, --type [type]', '执行的命令类型，示例：server, build')
	.option('-e, --env [env]', '当前环境，会被注入到 process.env 中')
	.parse(process.argv)

const ParseConfig = config => {
  let templatePath = ResolveRoot(config.template)
  

  return {
    ...config,
    webpackConfigDev: require(ResolveRoot(config.webpackConfigDev)),
    webpackConfigProd: require(ResolveRoot(config.webpackConfigProd)),
    template: Fs.readFileSync(templatePath).toString(),
    templateName: Path.basename(templatePath)
  }
}

let peakConfig = ParseConfig({
  ...require(ResolveRoot('peak.config')),
  type: Cli.type,
  env: Cli.env
})

const Types = {
  server(config) {
    Server(config)
  },
  build(config) {
    Build(config)
  }
}

Types[peakConfig.type](peakConfig)