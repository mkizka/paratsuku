const packageJson = require('./package')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

module.exports = {
  configureWebpack: {
    plugins: [
      new FaviconsWebpackPlugin({
        logo: './src/assets/profile.png',
        favicons: {
          appName: 'パラツク -Paratsuku- パラパラ漫画を書いて即ツイート',
          appShortName: 'Paratsuku',
          description: packageJson.description,
          version: packageJson.version,
          lang: 'ja',
          theme_color: '#363636',
          icons: {
            android: true,
            appleIcon: true,
            appleStartup: true,
            coast: false,
            favicons: true,
            firefox: false,
            windows: false,
            yandex: false
          }
        }
      })
    ]
  }
}
