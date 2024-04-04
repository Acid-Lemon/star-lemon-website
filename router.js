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
					name: "创作者",
					svg: "/static/svg/创作者.svg"
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
				show: {
					copyright: false
				},
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
			component: () => import("@/src/views/AdminView.vue")
		},
    {
      path: "/countdown",
      name: "countdown",
      component: () => import("@/src/views/CountdownView.vue")
    }
	],
});

export default router;