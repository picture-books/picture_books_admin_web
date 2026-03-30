import type { AdminStats } from "#/api/types";

import { requestClient } from "#/api/request";

export function getAdminStatsApi() {
  return requestClient.get<AdminStats>("/stats");
}
