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
                    svg: "ri-home-8-line"
                },
                show: {
                    side_navigation_bar: false,
                }
            },
            component: () => import("@/src/views/index/index.vue")
        },
        {
            path: "/article",
            name: "article",
            meta: {
                title: "文章",
                navigation_bar: {
                    name: "文章",
                    svg: "ri-article-line"
                },
                show: {
                    side_navigation_bar: false,
                }
            },
            component: () => import("@/src/views/article/article.vue")
        },
        {
            path: "/article/read",
            name: "read",
            meta: {
                title: "阅读",
                show: {
                    navigation_bar: false,
                    side_navigation_bar: false,
                }
            },
            component: () => import("@/src/views/write/read.vue")
        },
        {
            path: "/album",
            name: "album",
            meta: {
                title: "相册",
                navigation_bar: {
                    name: "相册",
                    svg: "ri-folder-image-line"
                },
                show: {
                    side_navigation_bar: false,
                }
            },
            component: () => import("@/src/views/album/album.vue")
        },
        {
            path: "/album/image",
            name: "image",
            meta: {
                title: "图片",
                show: {
                    navigation_bar: false,
                    side_navigation_bar: false,
                }
            },
            component: () => import("@/src/views/image/image.vue")
        },
        {
            path: "/developer",
            name: "developer",
            meta: {
                title: "开发者",
                navigation_bar: {
                    name: "开发者",
                    svg: "ri-id-card-line"
                },
                show: {
                    side_navigation_bar: false,
                }
            },
            component: () => import("@/src/views/developer.vue")
        },
        {
            path: "/comment",
            name: "comment",
            meta: {
                title: "留言板",
                navigation_bar: {
                    name: "留言板",
                    svg: "ri-message-line"
                },
                show: {
                    side_navigation_bar: false,
                }
            },
            component: () => import("@/src/views/comment/comment.vue")
        },
        {
            path: "/login",
            name: "login",
            meta: {
                title: "登录",
                navigation_bar: {
                    name: "登录",
                    svg: "ri-user-line"
                },
                show: {
                    side_navigation_bar: false,
                },
                login: false
            },
            component: () => import("@/src/views/user/login.vue")
        },
        {
            path: "/user",
            name: "user",
            meta: {
                title: "个人",
                navigation_bar: {
                    name: "个人",
                    svg: "ri-user-line"
                },
                show: {
                    side_navigation_bar: false,
                }
            },
            component: () => import("@/src/views/user/user.vue")
        },
        {
            path: "/admin",
            name: "admin",
            meta: {
                title: "管理",
                navigation_bar: {
                    name: "管理",
                    svg: "ri-admin-line"
                },
                side_navigation_bar: {
                    name: "首页",
                    svg: "ri-home-8-line"
                },
                show: {
                    navigation_bar: false
                },
            },
            component: () => import("@/src/views/index/index-admin.vue")
        },
        {
            path: "/admin/article",
            name: "article-admin",
            meta: {
                title: "文章管理",
                side_navigation_bar: {
                    name: "文章",
                    svg: "ri-article-line"
                },
                show: {
                    navigation_bar: false,
                }
            },
            component: () => import("@/src/views/article/article-admin.vue")
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
            component: () => import("@/src/views/write/write-admin.vue")
        },
        {
            path: "/admin/album",
            name: "album-admin",
            meta: {
                title: "相册管理",
                side_navigation_bar: {
                    name: "相册",
                    svg: "ri-folder-image-line"
                },
                show: {
                    navigation_bar: false,
                },
            },
            component: () => import("@/src/views/album/album-admin.vue")
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
            component: () => import("@/src/views/image/image-admin.vue")
        },
        {
            path: "/admin/comment",
            name: "comment-admin",
            meta: {
                title: "留言管理",
                side_navigation_bar: {
                    name: "留言",
                    svg: "ri-message-line"
                },
                show: {
                    navigation_bar: false,
                }
            },
            component: () => import("@/src/views/comment/comment-admin.vue")
        },
        {
            path: "/admin/online-tools",
            name: "online-tools-admin",
            meta: {
                title: "在线工具管理",
                side_navigation_bar: {
                    name: "工具",
                    svg: "ri-tools-line"
                },
                show: {
                    navigation_bar: false,
                }
            },
            component: () => import("@/src/views/index/online-tools-admin.vue")
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
            component: () => import("@/src/views/useful_tools/separate-audio.vue")
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
            component: () => import("@/src/views/404.vue")
        },
        {
            path: "/:pathMatch(.*)*",
            redirect: "/404"
        }
    ],
});


router.beforeEach((to, from, next) => {
    const user_info = JSON.parse(localStorage.getItem('user'))?.data;

    const to_user = to.path === '/user'
    const to_admin = to.matched.some(record => record.path === '/admin')

    if (!user_info) {
        if (to_user || to_admin) {
            next('/login');
            return;
        }
    } else {
        if (to_admin && user_info?.role !== 'admin') {
            next('/user');
            return;
        }
    }

    if (to.meta?.title) {
        document.title = to.meta.title + " | star和lemon的小站"
    } else {
        document.title = "star和lemon的小站"
    }

    next()
});


export default router;
