// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
//  server: {
//    host: '0.0.0.0',  // 监听所有网络接口
//    // 默认 port 是 5173，所以如果你不设置的话，它会使用默认端口 5173
    // 如果需要修改端口，可以指定 port: 8081 或其他端口
//    disableHostCheck: true,  // 防止 host check 问题
//  },
});
