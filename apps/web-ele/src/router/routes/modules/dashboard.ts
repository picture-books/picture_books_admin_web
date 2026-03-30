import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    meta: {
      authority: ["dashboard:view"],
      icon: "lucide:layout-dashboard",
      order: -1,
      title: "仪表盘",
    },
    name: "Dashboard",
    path: "/dashboard",
    children: [
      {
        name: "Analytics",
        path: "/analytics",
        component: () => import("#/views/dashboard/analytics/index.vue"),
        meta: {
          affixTab: true,
          authority: ["dashboard:view"],
          icon: "lucide:area-chart",
          title: "数据概览",
        },
      },
    ],
  },
];

export default routes;
