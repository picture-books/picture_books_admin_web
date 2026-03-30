import type { AdminBook, PageData } from "#/api/types";

import { requestClient } from "#/api/request";

export function getAdminBookListApi(params: {
  author_id?: number;
  order_by?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  status?: number;
  title?: string;
}) {
  return requestClient.get<PageData<AdminBook>>("/books", { params });
}

export function getAdminBookDetailApi(id: number) {
  return requestClient.get<AdminBook>(`/books/${id}`);
}

export function publishAdminBookApi(id: number) {
  return requestClient.post(`/books/${id}/publish`);
}

export function approveAdminBookApi(id: number) {
  return requestClient.post(`/books/${id}/approve`);
}

export function rejectAdminBookApi(id: number) {
  return requestClient.post(`/books/${id}/reject`);
}

export function unpublishAdminBookApi(id: number) {
  return requestClient.post(`/books/${id}/unpublish`);
}

export function deleteAdminBookApi(id: number) {
  return requestClient.delete(`/books/${id}`);
}
