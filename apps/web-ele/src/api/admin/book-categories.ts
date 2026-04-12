import type { BookCategoryAdminItem } from "#/api/types";

import { requestClient } from "#/api/request";

export function getAdminBookCategoriesApi() {
  return requestClient.get<BookCategoryAdminItem[]>("/book-categories");
}

export function createAdminBookCategoryApi(body: {
  enabled?: boolean;
  name: string;
  sort_order?: number;
}) {
  return requestClient.post<BookCategoryAdminItem>("/book-categories", body);
}

export function updateAdminBookCategoryApi(
  id: number,
  body: {
    enabled?: boolean;
    name?: string;
    sort_order?: number;
  },
) {
  return requestClient.put<BookCategoryAdminItem>(
    `/book-categories/${id}`,
    body,
  );
}

export function deleteAdminBookCategoryApi(id: number) {
  return requestClient.delete(`/book-categories/${id}`);
}
