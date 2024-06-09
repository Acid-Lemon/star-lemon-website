import App from './App'

import "element-plus/dist/index.css";
import "./tailwind-build.css"


import {createSSRApp} from 'vue';

import router from "./router";


export function createApp() {
    const app = createSSRApp(App);
    app.use(router);

    return {
        app
    }
}