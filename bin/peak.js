#!/usr/bin/env node

const Cli = require('commander')
const Fs = require('fs')
const Path = require('path')
const Shell = require('shelljs')
const Yeoman = require('yeoman-environment')
const Webpack = require('webpack')

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

const ifThereIsPath = path =>{
  try {
    Fs.readdirSync(path)

    return true
  }
  catch (err) {
    return false
  }
}

const DownCommonCode = commonCode => {
  let all = []

  for (let gitPath of commonCode) {
    all.push(new Promise(resolve => {
      let gitPathName = ResolveRoot(`node_modules/${Path.basename(gitPath).replace('.git', '')}`)

      if (ifThereIsPath(gitPathName)) {
        Shell.rm('-rf', gitPathName)
      }

      console.log(`git clone ${gitPath}`)

      Shell.exec(`git clone ${gitPath} ${gitPathName}`, {silent: true}, code => {
        if (code !== 0) {
          Shell.echo(`Down ${gitPath} error!`)
          Shell.exit(1)
        }
        else {
          console.log(`npm install ${gitPathName}`)
  
          Shell.exec(`cd ${gitPathName} && npm install`, {silent: true}, () => {
            resolve()
          })
        }
      })
    }))
  }

  return Promise.all(all)
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
    ...require(ResolveRoot('peak.config')),
    type: Cli.type,
    env: Cli.env
  })
  
  const Types = {
    server(config) {
      DownCommonCode(config.commonCode).then(() => {
        Server(config)
      })
    },
    build(config) {
      DownCommonCode(config.commonCode).then(() => {
        Build(config)
      })
    }
  }
  
  Types[peakConfig.type](peakConfig)
}