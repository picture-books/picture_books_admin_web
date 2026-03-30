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
        "task:list",
        "task:detail",
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
