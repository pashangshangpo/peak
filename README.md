# 简介

前端工程化解决方案

## 主要功能

- 提供多套不同类型的项目模板
- 可自定义模板项目
- 支持开发服务
- 支持任意设置环境变量
- 支持开发环境代理

## 入门指南

1. 安装

```
npm install fe-peak
```

2. 配置相应路径

peak.config.js
```
module.exports = {
  // 开发环境配置，导出一份 webpack 配置
  webpackConfigDev: 'config/webpack.config.dev.js',
  // 生产环境配置，导出一份 webpack 配置
  webpackConfigProd: 'config/webpack.config.prod.js',
  // 模板文件路径
  template: 'index.html',
  // 静态资源目录路径
  publicPath: '/public',
}
```

3. 配置 scripts

![](https://image-static.segmentfault.com/166/992/166992228-5cac6048ac4c3_articlex)

- env: 环境变量，最终会被注入到 window.Peak.env 变量中
- type: [server, build] 开启本地开发服务或进行项目编译
- port: 固定端口号，默认随机

4. 本地开发

```
yarn start
```

5. 生产编译

```
yarn build
```

## 创建项目

```
fe-peak
```

根据提示进行下一步，直到完成

## 命令行工具

![](https://image-static.segmentfault.com/362/816/3628166686-5cbc32c8d777f_articlex)

## 代理

```
fetch(`${window.Peak.proxyUrl}http://www.taobao.com`)
```
