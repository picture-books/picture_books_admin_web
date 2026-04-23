import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    meta: {
      authority: [
        "appuser:list",
        "appuser:detail",
        "book:list",
        "book:detail",
        "book:approve",
        "book:reject",
        "book:unpublish",
        "book:delete",
        "book:recommend_list",
        "book:recommend_write",
        "book:category_list",
        "book:category_write",
        "book:generate",
        "task:list",
        "task:detail",
        "feedback:list",
      ],
      icon: "lucide:book-open",
      order: 0,
      title: "运营",
    },
    name: "BizOps",
    path: "/ops",
    children: [
      {
        name: "OpsAppUsers",
        path: "/ops/app-users",
        component: () => import("#/views/ops/app-user/list.vue"),
        meta: {
          authority: ["appuser:list"],
          icon: "lucide:users",
          title: "App 用户",
        },
      },
      {
        name: "OpsAppUserDetail",
        path: "/ops/app-users/:id",
        component: () => import("#/views/ops/app-user/detail.vue"),
        meta: {
          authority: ["appuser:detail"],
          hideInMenu: true,
          title: "用户详情",
        },
      },
      {
        name: "OpsBooks",
        path: "/ops/books",
        component: () => import("#/views/ops/book/list.vue"),
        meta: {
          authority: ["book:list"],
          icon: "lucide:library",
          title: "绘本管理",
        },
      },
      {
        name: "OpsBookRecommend",
        path: "/ops/books/recommend",
        component: () => import("#/views/ops/book/recommend.vue"),
        meta: {
          authority: ["book:recommend_list"],
          icon: "lucide:sparkles",
          title: "热门推荐",
        },
      },
      {
        name: "OpsBookCategories",
        path: "/ops/books/categories",
        component: () => import("#/views/ops/book/categories.vue"),
        meta: {
          authority: ["book:category_list"],
          icon: "lucide:tags",
          title: "绘本分类",
        },
      },
      {
        name: "OpsBookGenerate",
        path: "/ops/books/generate",
        component: () => import("#/views/ops/book/generate.vue"),
        meta: {
          authority: ["book:generate"],
          icon: "lucide:wand-2",
          title: "生成绘本",
        },
      },
      {
        name: "OpsBookDetail",
        path: "/ops/books/:id",
        component: () => import("#/views/ops/book/detail.vue"),
        meta: {
          authority: ["book:detail"],
          hideInMenu: true,
          title: "绘本详情",
        },
      },
      {
        name: "OpsGenTasks",
        path: "/ops/book-gen-tasks",
        component: () => import("#/views/ops/task/list.vue"),
        meta: {
          authority: ["task:list"],
          icon: "lucide:list-todo",
          title: "生成任务",
        },
      },
      {
        name: "OpsFeedbacks",
        path: "/ops/feedbacks",
        component: () => import("#/views/ops/feedback/list.vue"),
        meta: {
          authority: ["feedback:list"],
          icon: "lucide:message-square-text",
          title: "意见反馈",
        },
      },
      {
        name: "OpsFeedbackDetail",
        path: "/ops/feedbacks/:id",
        component: () => import("#/views/ops/feedback/detail.vue"),
        meta: {
          authority: ["feedback:list"],
          hideInMenu: true,
          title: "反馈详情",
        },
      },
      {
        name: "OpsGenTaskDetail",
        path: "/ops/book-gen-tasks/:id",
        component: () => import("#/views/ops/task/detail.vue"),
        meta: {
          authority: ["task:detail"],
          hideInMenu: true,
          title: "任务详情",
        },
      },
    ],
  },
];

export default routes;
