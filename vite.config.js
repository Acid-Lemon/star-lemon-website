import {defineConfig} from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers';

import terser from "@rollup/plugin-terser";

/** ==== 处理 tailwind cli 的自动启动和打包 ==== */
const child_process = require('child_process')
let tailwindMode = process.env.NODE_ENV

// 主进程输出
console.log(`[tailwindcss] 开始${tailwindMode === 'production' ? '生产环境打包' : '开发模式监听'}`);
child_process.exec(
    // 这里指令对应 package.json 中的 npm scripts
    tailwindMode === 'production'
        ? 'npm run tailwind-build'
        : 'npm run tailwind-dev',
    {
        cwd: __dirname, // 切换目录到当前项目，必须
    },
    (error, stdout, stderr) => {
        // tailwind --watch 是一个持久进程，不会立即执行回调
        // process.stdout.write('tailwind success')
        if (error) {
            console.error('[tailwindcss] 异常，请检查');
            console.error(error);
            console.error(stdout);
            console.error(stderr);
        }
        if (tailwindMode === 'production') {
            console.log('[tailwindcss] 生产环境打包完成');
        }
    })

export default defineConfig({
    plugins: [
        uni(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),

        terser(),
    ],
    build: {
        rollupOptions: {
            manualChunks: (id) => {
                if (id.includes('node_modules/vue')) {
                    return 'vue-vendor';
                } else if (id.includes('node_modules')) {
                    return 'other-vendor';
                }
            }
        },
        minify: "terser",
        terserOptions: {
            compress: {
                drop_debugger: true,
                dead_code: true,
                collapse_vars: true,
                reduce_vars: true,
                reduce_funcs: true,
                pure_funcs: ["console.log", "console.debug", "console.info"],
            },
            format: {
                comments: false
            }
        },
        /*cssCodeSplit: true,
        cssMinify: "lightningcss"*/
    },
    /*css: {
        transformer: "lightningcss"
    }*/
});
