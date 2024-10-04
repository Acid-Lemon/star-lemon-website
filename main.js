import App from './App';

import "element-plus/dist/index.css";
import "./tailwind-build.css";

import {createSSRApp} from 'vue';
import {createPinia} from 'pinia';

import router from "./router";


export function createApp() {
    const app = createSSRApp(App);
    const pinia = createPinia();
    app.use(router);
    app.use(pinia);

    return {
        app
    }
}