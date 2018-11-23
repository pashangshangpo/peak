#!/usr/bin/env node

const Cli = require('commander')
const Fs = require('fs')
const Path = require('path')
const Shell = require('shelljs')
const Yeoman = require('yeoman-environment')

const Server = require('./types/server')
const Build = require('./types/build')
const { ResolveRoot } = require('./lib/util')

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

const DownCommonCode = commonCode => {
  for (let gitPath of commonCode) {
    if (Shell.exec(`npm install ${gitPath} --save-dev`).code !== 0) {
      Shell.echo(`Down ${gitPath} error!`)
      Shell.exit(1)
    }
  }
}

if (Cli.type == undefined) {
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
  let peakConfig = ParseConfig({
    publicPath: '/public',
    commonCode: [],
    injectScript: `
      <script>
        window.Peak = ${JSON.stringify({
          env: Cli.env
        })};
      </script>
    `,
    ...require(ResolveRoot('peak.config')),
    type: Cli.type,
    env: Cli.env
  })
  
  const Types = {
    server(config) {
      DownCommonCode(config.commonCode)
      Server(config)
    },
    build(config) {
      DownCommonCode(config.commonCode)
      Build(config)
    }
  }
  
  Types[peakConfig.type](peakConfig)
}