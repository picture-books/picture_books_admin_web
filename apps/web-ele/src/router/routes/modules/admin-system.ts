import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    meta: {
      authority: ["adminuser:list", "role:list", "permission:list", "system:device_policy"],
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
