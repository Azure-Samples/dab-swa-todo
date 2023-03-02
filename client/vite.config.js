import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const { gitDescribe, gitDescribeSync } = require('git-describe');

process.env.VITE_APP_VERSION = require('./package.json').version
process.env.VITE_APP_GIT_HASH = gitDescribeSync().hash

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    hmr: true,
    watch: {
      usePolling: true
    }
  }
})
