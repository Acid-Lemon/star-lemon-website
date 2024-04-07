import {
  createRouter,
  createWebHashHistory
} from "vue-router";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [{
      path: "/",
      name: "index",
      meta: {
        navigation_bar: {
          name: "首页",
          svg: "/static/svg/首页.svg"
        },
      },
      component: () => import("@/src/views/IndexView.vue")
    },
    {
      path: "/developer",
      name: "developer",
      meta: {
        navigation_bar: {
          name: "开发者",
          svg: "/static/svg/开发者.svg"
        },
      },
      component: () => import("@/src/views/DeveloperView.vue")
    },
    {
      path: "/comment",
      name: "comment",
      meta: {
        navigation_bar: {
          name: "留言板",
          svg: "/static/svg/留言板.svg"
        }
      },
      component: () => import("@/src/views/CommentView.vue")
    },
    {
      path: "/login",
      name: "login",
      meta: {
        navigation_bar: {
          name: "登录",
          svg: "/static/svg/登录.svg"
        },
        login: false
      },
      component: () => import("@/src/views/LoginView.vue")
    },
    {
      path: "/admin",
      name: "admin",
      meta: {
        show: {
          navigation_bar: false
        }
      },
      component: () => import("@/src/views/AdminView.vue")
    },
    {
      path: "/user",
      name: "user",
      meta: {
        navigation_bar: {
          name: "用户名",
          svg: "/static/svg/登录.svg"
        }
      },
      component: () => import("@/src/views/User.vue")
    },
    {
      path: "/countdown",
      name: "countdown",
      meta: {
        show: {
          navigation_bar: false
        }
      },
      component: () => import("@/src/views/CountdownView.vue")
    },
  ],
});

export default router;