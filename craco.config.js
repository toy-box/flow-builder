/* craco.config.js */
const CracoLessPlugin = require('craco-less');
const devConfig = require('./dev.config');

module.exports = {
  devServer: {
    port: 3001,
    proxy: {
      '/toolbox': {
        target: devConfig.apiRoot,
        secure: devConfig.secure,
        changeOrigin: devConfig.changeOrigin,
      }
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
