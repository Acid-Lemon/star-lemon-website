import {createRouter, createWebHashHistory} from "vue-router";

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "index",
            meta: {
                title: "首页",
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
                title: "文章",
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
            path: "/article/:article_title",
            name: "read",
            meta: {
                title: "阅读",
                show: {
                    navigation_bar: false,
                    side_navigation_bar: false,
                }
            },
            component: () => import("@/src/views/write/ReadView.vue")
        },
        {
            path: "/album",
            name: "album",
            meta: {
                title: "相册",
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
            path: "/album/:album_name",
            name: "image",
            meta: {
                title: "图片",
                show: {
                    navigation_bar: false,
                    side_navigation_bar: false,
                }
            },
            component: () => import("@/src/views/image/ImageView.vue")
        },
        {
            path: "/developer",
            name: "developer",
            meta: {
                title: "开发者",
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
                title: "留言板",
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
                title: "登录",
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
            path: "/user",
            name: "user",
            meta: {
                title: "个人",
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
            path: "/admin",
            name: "admin",
            meta: {
                title: "管理",
                navigation_bar: {
                    name: "管理",
                    svg: "/static/svg/管理.svg"
                },
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
                title: "文章管理",
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
            path: "/admin/article/write",
            name: "write-admin",
            meta: {
                title: "发布文章",
                show: {
                    navigation_bar: false,
                    side_navigation_bar: false,
                }
            },
            component: () => import("@/src/views/write/WriteAdminView.vue")
        },
        {
            path: "/admin/album",
            name: "album-admin",
            meta: {
                title: "相册管理",
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
            path: "/admin/album/:album_name",
            name: "image-admin",
            meta: {
                title: "图片管理",
                show: {
                    navigation_bar: false,
                    side_navigation_bar: false,
                },
            },
            component: () => import("@/src/views/image/ImageAdminView.vue")
        },
        {
            path: "/admin/comment",
            name: "comment-admin",
            meta: {
                title: "留言管理",
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
            path: "/useful_tools/separate_audio",
            name: "separate_audio",
            meta: {
                title: "分离音频",
                show: {
                    navigation_bar: false,
                    side_navigation_bar: false
                }
            },
            component: () => import("@/src/views/useful_tools/separate_audio.vue")
        },
        {
            path: "/particles/particle_text",
            name: "particle_text",
            meta: {
                title: "粒子文字",
                show: {
                    navigation_bar: false,
                    side_navigation_bar: false
                }
            },
            component: () => import("@/src/views/particles/particle_text.vue")
        },
        {
            path: "/404",
            name: "404",
            meta: {
                title: "404",
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


router.beforeEach((to, from) => {//beforeEach是router的钩子函数，在进入路由前执行
    if (to.meta?.title) {
        document.title = to.meta.title + "|star和lemon的小站"
    } else {
        document.title = "star和lemon的小站"
    }
});


export default router;
