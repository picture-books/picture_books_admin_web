import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    meta: {
      authority: [
        "adminuser:list",
        "role:list",
        "permission:list",
        "system:device_policy",
        "system:app_about",
        "system:bookgen_ai",
        "system:doubao_tts",
      ],
      icon: "lucide:settings",
      order: 100,
      title: "系统管理",
    },
    name: "AdminSystem",
    path: "/system",
    children: [
      {
        name: "SystemDevicePolicy",
        path: "/system/device-policy",
        component: () => import("#/views/system/device-policy/index.vue"),
        meta: {
          authority: ["system:device_policy"],
          icon: "lucide:smartphone",
          title: "设备策略",
        },
      },
      {
        name: "SystemAppAbout",
        path: "/system/app-about",
        component: () => import("#/views/system/app-about/index.vue"),
        meta: {
          authority: ["system:app_about"],
          icon: "lucide:info",
          title: "App 关于文案",
        },
      },
      {
        name: "SystemBookgenAI",
        path: "/system/bookgen-ai",
        component: () => import("#/views/system/bookgen-ai/index.vue"),
        meta: {
          authority: ["system:bookgen_ai"],
          icon: "lucide:sparkles",
          title: "绘本 AI 服务商",
        },
      },
      {
        name: "SystemDoubaoTts",
        path: "/system/doubao-tts",
        component: () => import("#/views/system/doubao-tts/index.vue"),
        meta: {
          authority: ["system:doubao_tts"],
          icon: "lucide:mic",
          title: "豆包语音合成",
        },
      },
      {
        name: "SystemAdminUsers",
        path: "/system/admin-users",
        component: () => import("#/views/system/admin-user/list.vue"),
        meta: {
          authority: ["adminuser:list"],
          icon: "lucide:user-cog",
          title: "管理员",
        },
      },
      {
        name: "SystemRoles",
        path: "/system/roles",
        component: () => import("#/views/system/role/list.vue"),
        meta: {
          authority: ["role:list"],
          icon: "lucide:shield",
          title: "角色",
        },
      },
      {
        name: "SystemPermissions",
        path: "/system/permissions",
        component: () => import("#/views/system/permission/index.vue"),
        meta: {
          authority: ["permission:list"],
          icon: "lucide:key-round",
          title: "权限点",
        },
      },
    ],
  },
];

export default routes;
