module.exports = {
  parallel: false,
  chainWebpack: config => {
    config.module
      .rule('ts')
      .use('ts-loader')
      .loader('ts-loader')
      .tap(opts => {
        opts.configFile = 'tsconfig.lib.json'
        opts.transpileOnly = false
        opts.happyPackMode = false
        return opts
      })
  }
}
