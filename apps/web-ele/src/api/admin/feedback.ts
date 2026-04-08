import type { AdminFeedbackDetail, AdminFeedbackRow, PageData } from "#/api/types";

import { requestClient } from "#/api/request";

export function getFeedbackListApi(params: { page?: number; page_size?: number }) {
  return requestClient.get<PageData<AdminFeedbackRow>>("/feedbacks", {
    params,
  });
}

export function getFeedbackDetailApi(id: number) {
  return requestClient.get<AdminFeedbackDetail>(`/feedbacks/${id}`);
}
