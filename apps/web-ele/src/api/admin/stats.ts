import { requestClient } from "#/api/request";

import type { AdminStats } from "#/api/types";

export function getAdminStatsApi() {
  return requestClient.get<AdminStats>("/stats");
}
