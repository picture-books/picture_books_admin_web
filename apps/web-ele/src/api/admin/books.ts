import { requestClient } from "#/api/request";

import type { AdminBook, PageData } from "#/api/types";

export function getAdminBookListApi(params: {
  page?: number;
  page_size?: number;
  order_by?: string;
  sort_by?: string;
  status?: number;
  author_id?: number;
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
