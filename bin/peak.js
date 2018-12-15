#!/usr/bin/env node

const Cli = require('commander')
const Fs = require('fs')
const Path = require('path')
const Webpack = require('webpack')
const { Git, CheckYarnInstall, Shell, Exec } = require('shell-tool')

const { ResolveRoot } = require('./lib/util')

Cli
	.version('0.0.1')
	.description('前端工程化解决方案')
	.option('-t, --type [type]', '执行的命令类型，示例：server, build')
	.option('-e, --env [env]', '当前环境，会被注入到 process.env 中')
	.parse(process.argv)

const ParseConfig = config => {
  let templatePath = ResolveRoot(config.template)
  let webpackConfigDev = require(ResolveRoot(config.webpackConfigDev))
  let webpackConfigProd = require(ResolveRoot(config.webpackConfigProd))
  let inject = new Webpack.DefinePlugin({
    Peak: {
      env: JSON.stringify(Cli.env)
    }
  })

  webpackConfigDev.plugins.unshift(inject)
  webpackConfigProd.plugins.unshift(inject)
  
  return {
    ...config,
    webpackConfigDev: webpackConfigDev,
    webpackConfigProd: webpackConfigProd,
    template: Fs.readFileSync(templatePath).toString(),
    templatePath: templatePath,
    templateName: Path.basename(templatePath)
  }
}

const DownCommonCode = async commonCode => {
  let all = []
  let checkYarn = await CheckYarnInstall()
  let install = checkYarn ? 'yarn' : 'npm'

  for (let gitPath of commonCode) {
    all.push(new Promise(resolve => {
      Git
        .Clone(gitPath, ResolveRoot('src/node_modules'))
        .then(res => {
          if (res.code === 0) {
            return res.targetPath
          }
          else {
            console.error(res.error)

            process.exit(1)
          }
        })
        .then(targetPath => {
          console.log(`install ${targetPath}`)
          
          Exec(`cd ${targetPath} && ${install}`).then(() => {
            resolve()
          })
        })
    }))
  }

  return Promise.all(all)
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
  let peakConfig = ParseConfig({
    publicPath: '/public',
    commonCode: [],
    ...require(ResolveRoot('peak.config')),
    type: Cli.type,
    env: Cli.env
  })
  
  const Types = {
    server(config) {
      DownCommonCode(config.commonCode).then(() => {
        const Server = require('./types/server')

        console.log('公共代码下载完成')

        Server(config)
      })
    },
    build(config) {
      DownCommonCode(config.commonCode).then(() => {
        const Build = require('./types/build')

        console.log('公共代码下载完成')
        
        Build(config)
      })
    }
  }
  
  Types[peakConfig.type](peakConfig)
}