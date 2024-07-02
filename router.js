import {createRouter, createWebHashHistory} from "vue-router";

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "index",
            meta: {
                navigation_bar: {
                    name: "首页",
                    svg: "/static/svg/首页.svg"
                },
                show: {
                    side_navigation_bar: false,
                }
            },
            component: () => import("@/src/views/index/IndexView.vue")
        },
        {
            path: "/article",
            name: "article",
            meta: {
                navigation_bar: {
                    name: "文章",
                    svg: "/static/svg/文章.svg"
                },
                show: {
                    side_navigation_bar: false,
                }
            },
            component: () => import("@/src/views/article/ArticleView.vue")
        },
        {
            path: "/article/note",
            name: "note",
            meta: {
                show: {
                    navigation_bar: false,
                    side_navigation_bar: false,
                }
            },
            component: () => import("@/src/views/article/NoteView.vue")
        },
        {
            path: "/album",
            name: "album",
            meta: {
                navigation_bar: {
                    name: "相册",
                    svg: "/static/svg/相册.svg"
                },
                show: {
                    side_navigation_bar: false,
                }
            },
            component: () => import("@/src/views/album/AlbumView.vue")
        },
        {
            path: "/developer",
            name: "developer",
            meta: {
                navigation_bar: {
                    name: "开发者",
                    svg: "/static/svg/开发者.svg"
                },
                show: {
                    side_navigation_bar: false,
                }
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
                },
                show: {
                    side_navigation_bar: false,
                }
            },
            component: () => import("@/src/views/comment/CommentView.vue")
        },
        {
            path: "/login",
            name: "login",
            meta: {
                navigation_bar: {
                    name: "登录",
                    svg: "/static/svg/登录.svg"
                },
                show: {
                    side_navigation_bar: false,
                },
                login: false
            },
            component: () => import("@/src/views/user/LoginView.vue")
        },
        {
            path: "/admin",
            name: "admin",
            meta: {
                side_navigation_bar: {
                    name: "首页",
                    svg: "/static/svg/首页.svg"
                },
                show: {
                    navigation_bar: false
                },
            },
            component: () => import("@/src/views/index/IndexAdminView.vue")
        },
        {
            path: "/admin/article",
            name: "article-admin",
            meta: {
                side_navigation_bar: {
                    name: "文章",
                    svg: "/static/svg/文章.svg"
                },
                show: {
                    navigation_bar: false,
                }
            },
            component: () => import("@/src/views/article/ArticleAdminView.vue")
        },
        {
            path: "/admin/album",
            name: "album-admin",
            meta: {
                side_navigation_bar: {
                    name: "相册",
                    svg: "/static/svg/相册.svg"
                },
                show: {
                    navigation_bar: false,
                },
            },
            component: () => import("@/src/views/album/AlbumAdminView.vue")
        },
        {
            path: "/admin/comment",
            name: "comment-admin",
            meta: {
                side_navigation_bar: {
                    name: "留言",
                    svg: "/static/svg/留言板.svg"
                },
                show: {
                    navigation_bar: false,
                }
            },
            component: () => import("@/src/views/comment/CommentAdminView.vue")
        },
        {
            path: "/user",
            name: "user",
            meta: {
                navigation_bar: {
                    name: "个人",
                    svg: "/static/svg/登录.svg"
                },
                show: {
                    side_navigation_bar: false,
                }
            },
            component: () => import("@/src/views/user/UserView.vue")
        },
        {
            path: "/404",
            name: "404",
            meta: {
                show: {
                    navigation_bar: false,
                    side_navigation_bar: false,
                },
            },
            component: () => import("@/src/views/404View.vue")
        },
        {
            path: "/:pathMatch(.*)*",
            redirect: "/404"
        }
    ],
});

export default router;
