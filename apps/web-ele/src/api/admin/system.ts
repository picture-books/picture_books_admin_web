import { requestClient } from "#/api/request";

import type {
  AdminPermission,
  AdminRole,
  AdminUserDetail,
  AdminUserRow,
  DevicePolicy,
  PageData,
} from "#/api/types";

export function getAdminUserListApi(params: { page?: number; page_size?: number }) {
  return requestClient.get<PageData<AdminUserRow>>("/system/admin-users", {
    params,
  });
}

export function getAdminUserDetailApi(id: number) {
  return requestClient.get<AdminUserDetail>(`/system/admin-users/${id}`);
}

export function createAdminUserApi(body: {
  username: string;
  password: string;
  real_name?: string;
  role_ids?: number[];
}) {
  return requestClient.post("/system/admin-users", body);
}

export function updateAdminUserApi(
  id: number,
  body: {
    real_name?: string;
    status?: number;
    role_ids?: number[];
    new_password?: string;
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
  name: string;
  description?: string;
  permission_ids?: number[];
}) {
  return requestClient.post("/system/roles", body);
}

export function updateAdminRoleApi(
  id: number,
  body: {
    name: string;
    description?: string;
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
