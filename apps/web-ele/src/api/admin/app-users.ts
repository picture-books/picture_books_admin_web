import type {
  AdminReadingSessionItem,
  AdminReadingSummaryResp,
  AppUserDetailItem,
  AppUserListItem,
  PageData,
} from "#/api/types";

import { requestClient } from "#/api/request";

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

export function patchAppUserDevicePolicyApi(id: number, max_devices_override?: null | number) {
  return requestClient.request(`/app-users/${id}/device-policy`, {
    data: { max_devices_override },
    method: "PATCH",
  });
}

export function getAppUserReadingSummaryApi(
  id: number,
  params: { as_of_local_date: string; timezone_iana: string },
) {
  return requestClient.get<AdminReadingSummaryResp>(`/app-users/${id}/reading-summary`, { params });
}

export function getAppUserReadingSessionsApi(
  id: number,
  params: { page?: number; page_size?: number },
) {
  return requestClient.get<PageData<AdminReadingSessionItem>>(`/app-users/${id}/reading-sessions`, {
    params,
  });
}
