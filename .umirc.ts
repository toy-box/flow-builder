import { defineConfig } from 'dumi';
const devConfig = require('./dev.config');

export default defineConfig({
  title: 'flow-builder',
  favicon:
    'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  logo: 'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  outputPath: 'docs-dist',
  base: '/flow-builder',
  publicPath: '/',
  mode: 'site',
  proxy: {
    '/toolbox': {
      target: devConfig.apiRoot,
      secure: devConfig.secure,
      changeOrigin: devConfig.changeOrigin,
    }
  },
  // more config: https://d.umijs.org/config
});
