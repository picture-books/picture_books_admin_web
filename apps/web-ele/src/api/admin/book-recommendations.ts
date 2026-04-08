import type { AdminBookRecommendationItem, BookRecommendSuggestionItem } from "#/api/types";

import { requestClient } from "#/api/request";

export function getBookRecommendationsApi() {
  return requestClient.get<AdminBookRecommendationItem[]>("/books/recommendations");
}

export function putBookRecommendationsApi(book_ids: number[]) {
  return requestClient.request("/books/recommendations", {
    method: "PUT",
    data: { book_ids },
  });
}

export function suggestBookRecommendationsApi(limit = 30) {
  return requestClient.post<BookRecommendSuggestionItem[]>(
    "/books/recommendations/suggest",
    {},
    { params: { limit } },
  );
}
