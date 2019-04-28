#!/usr/bin/env node

Promise.resolve().then(async () => {
  const Cli = require('commander')
  const Fs = require('fs')
  const Path = require('path')
  const Webpack = require('webpack')
  const { Shell } = require('@xiaozhihua/shell-tool')

  const { ResolveRoot, GetRandomPort, GetIp } = require('./lib/util')

  Cli
    .version('0.0.1')
    .description('前端工程化解决方案')
    .option('-t, --type [type]', '执行的命令类型，示例：server, build')
    .option('-e, --env [env]', '当前环境，会被注入到 process.env 中')
    .option('-p, --port [port]', '固定端口，默认随机')
    .option('-c, --config [config]', '配置文件路径，默认根目录 peak.config.js')
    .parse(process.argv)

  const Ip = GetIp()
  const Port = Cli.port || await new Promise(resolve => {
    GetRandomPort(port => {
      resolve(port)
    })
  })
    
  const ParseConfig = config => {
    let templatePath = ResolveRoot(config.template)
    let webpackConfigDev = require(ResolveRoot(config.webpackConfigDev))
    let webpackConfigProd = require(ResolveRoot(config.webpackConfigProd))
    let inject = new Webpack.DefinePlugin({
      Peak: JSON.stringify({
        ip: Ip,
        proxyUrl: `http://${Ip}:${Port}/proxy/`,
        env: Cli.env
      })
    })

    webpackConfigDev.plugins.unshift(inject)
    webpackConfigProd.plugins.unshift(inject)
    
    return {
      ...config,
      webpackConfigDev: webpackConfigDev,
      webpackConfigProd: webpackConfigProd,
      template: Fs.readFileSync(templatePath).toString(),
      templatePath: templatePath,
      templateName: Path.basename(templatePath),
      ip: Ip
    }
  }

  if (Cli.type == undefined) {
    const Yeoman = require('yeoman-environment')

    const AppCommand = 'peak'
    const GenerateTemplate = `generator-${AppCommand}`
    const YeomanRuntime = Yeoman.createEnv()

    Shell.exec(
      `npm install -g ${GenerateTemplate}`,
      {
        async: true,
        silent: true
      },
      () => {
        Shell.exec(
          'npm root -g',
          {
            async: true,
            silent: true
          },
          (code, stdout) => {
            const TemplatePath = Path.join(stdout.trim(), GenerateTemplate)

            YeomanRuntime.register(require.resolve(TemplatePath), AppCommand)
            YeomanRuntime.run(AppCommand)
          }
        )
      }
    )
  }
  else {
    const UserConfig = require(ResolveRoot(Cli.config || 'peak.config'))

    let peakConfig = ParseConfig({
      publicPath: '/public',
      ...UserConfig,
      type: Cli.type,
      env: Cli.env
    })
    
    const Types = {
      server(config) {
        require('./types/server')(config, {
          ...UserConfig,
          port: Port,
        })
      },
      build(config) {
        require('./types/build')(config, UserConfig)
      }
    }
    
    Types[peakConfig.type](peakConfig)
  }
})