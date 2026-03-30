import { requestClient } from "#/api/request";

import type { AppUserDetailItem, AppUserListItem, PageData } from "#/api/types";

export function getAppUserListApi(params: { page?: number; page_size?: number }) {
  return requestClient.get<PageData<AppUserListItem>>("/app-users", { params });
}

export function getAppUserDetailApi(id: number) {
  return requestClient.get<AppUserDetailItem>(`/app-users/${id}`);
}

export function patchAppUserStatusApi(id: number, status: number) {
  return requestClient.request(`/app-users/${id}/status`, {
    data: { status },
    method: "PATCH",
  });
}

export function patchAppUserDevicePolicyApi(id: number, max_devices_override?: number | null) {
  return requestClient.request(`/app-users/${id}/device-policy`, {
    data: { max_devices_override },
    method: "PATCH",
  });
}
