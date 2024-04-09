import {
    defineConfig
} from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers';

/** ==== 处理 tailwind cli 的自动启动和打包 ==== */
const child_process = require('child_process')
let tailwindMode = process.env.NODE_ENV

// 主进程输出
console.log(`[tailwindcss] 开始${tailwindMode === 'production' ? '生产环境打包' : '开发模式监听'}`);
child_process.execSync('npm run tailwind-build', {
    cwd: __dirname
});
if (tailwindMode !== 'development') {
    child_process.exec(
        'npm run tailwind-dev', {
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
}

export default defineConfig({
    plugins: [
        uni(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        })]
});
