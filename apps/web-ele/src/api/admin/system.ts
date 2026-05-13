import type {
  AdminPermission,
  AdminRole,
  AdminUserDetail,
  AdminUserRow,
  BookgenAIProviderRow,
  DevicePolicy,
  DoubaoTTSAdmin,
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

export function getDoubaoTtsApi() {
  return requestClient.get<DoubaoTTSAdmin>("/system/doubao-tts");
}

export function updateDoubaoTtsApi(body: {
  app_id: string;
  base_url: string;
  poll_every_ms: number;
  query_timeout_sec: number;
  resource_id: string;
  speaker: string;
  /** 非空则更新密钥；留空表示不修改 */
  access_key?: string;
}) {
  return requestClient.put<DoubaoTTSAdmin>("/system/doubao-tts", body);
}

export function getAppAboutApi() {
  return requestClient.get<{ content: string }>("/system/app-about");
}

export function updateAppAboutApi(content: string) {
  return requestClient.put<{ content: string }>("/system/app-about", { content });
}

export function getBookgenAIProvidersApi() {
  return requestClient.get<BookgenAIProviderRow[]>("/system/bookgen-ai-providers");
}

export function createBookgenAIProviderApi(body: {
  api_key: string;
  base_url: string;
  capability: string;
  driver: string;
  enabled?: boolean;
  extra?: string;
  model?: string;
  models?: string[];
  name: string;
}) {
  return requestClient.post<BookgenAIProviderRow>("/system/bookgen-ai-providers", body);
}

export function updateBookgenAIProviderApi(
  id: number,
  body: {
    api_key?: null | string;
    base_url?: string;
    driver?: string;
    enabled?: boolean;
    extra?: string;
    model?: string;
    models?: string[];
    name?: string;
  },
) {
  return requestClient.put<BookgenAIProviderRow>(`/system/bookgen-ai-providers/${id}`, body);
}

export function activateBookgenAIProviderApi(id: number) {
  return requestClient.post(`/system/bookgen-ai-providers/${id}/activate`);
}

export function deleteBookgenAIProviderApi(id: number) {
  return requestClient.delete(`/system/bookgen-ai-providers/${id}`);
}
