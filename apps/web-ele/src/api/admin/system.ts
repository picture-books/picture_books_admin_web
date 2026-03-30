import type {
  AdminPermission,
  AdminRole,
  AdminUserDetail,
  AdminUserRow,
  DevicePolicy,
  PageData,
} from "#/api/types";

import { requestClient } from "#/api/request";

export function getAdminUserListApi(params: { page?: number; page_size?: number }) {
  return requestClient.get<PageData<AdminUserRow>>("/system/admin-users", {
    params,
  });
}

export function getAdminUserDetailApi(id: number) {
  return requestClient.get<AdminUserDetail>(`/system/admin-users/${id}`);
}

export function createAdminUserApi(body: {
  password: string;
  real_name?: string;
  role_ids?: number[];
  username: string;
}) {
  return requestClient.post("/system/admin-users", body);
}

export function updateAdminUserApi(
  id: number,
  body: {
    new_password?: string;
    real_name?: string;
    role_ids?: number[];
    status?: number;
  },
) {
  return requestClient.put(`/system/admin-users/${id}`, body);
}

export function deleteAdminUserApi(id: number) {
  return requestClient.delete(`/system/admin-users/${id}`);
}

export function getAdminRoleListApi() {
  return requestClient.get<AdminRole[]>("/system/roles");
}

export function getAdminRoleDetailApi(id: number) {
  return requestClient.get<AdminRole>(`/system/roles/${id}`);
}

export function createAdminRoleApi(body: {
  code: string;
  description?: string;
  name: string;
  permission_ids?: number[];
}) {
  return requestClient.post("/system/roles", body);
}

export function updateAdminRoleApi(
  id: number,
  body: {
    description?: string;
    name: string;
    permission_ids?: number[];
  },
) {
  return requestClient.put(`/system/roles/${id}`, body);
}

export function deleteAdminRoleApi(id: number) {
  return requestClient.delete(`/system/roles/${id}`);
}

export function getAdminPermissionListApi() {
  return requestClient.get<AdminPermission[]>("/system/permissions");
}

export function getDevicePolicyApi() {
  return requestClient.get<DevicePolicy>("/system/device-policy");
}

export function updateDevicePolicyApi(max_devices_default: number) {
  return requestClient.put<DevicePolicy>("/system/device-policy", {
    max_devices_default,
  });
}
