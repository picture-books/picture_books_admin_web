import type { BookGenTask, PageData } from "#/api/types";

import { requestClient } from "#/api/request";

export function getBookGenTaskListApi(params: {
  page?: number;
  page_size?: number;
  status?: number;
  user_id?: number;
}) {
  return requestClient.get<PageData<BookGenTask>>("/book-gen-tasks", {
    params,
  });
}

export function getBookGenTaskDetailApi(id: number) {
  return requestClient.get<BookGenTask>(`/book-gen-tasks/${id}`);
}

export function deleteBookGenTaskApi(id: number) {
  return requestClient.delete<unknown>(`/book-gen-tasks/${id}`);
}

export function cancelBookGenTaskApi(id: number) {
  return requestClient.post<unknown>(`/book-gen-tasks/${id}/cancel`);
}
