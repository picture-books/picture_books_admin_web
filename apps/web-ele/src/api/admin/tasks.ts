import { requestClient } from "#/api/request";

import type { BookGenTask, PageData } from "#/api/types";

export function getBookGenTaskListApi(params: {
  page?: number;
  page_size?: number;
  user_id?: number;
  status?: number;
}) {
  return requestClient.get<PageData<BookGenTask>>("/book-gen-tasks", {
    params,
  });
}

export function getBookGenTaskDetailApi(id: number) {
  return requestClient.get<BookGenTask>(`/book-gen-tasks/${id}`);
}
