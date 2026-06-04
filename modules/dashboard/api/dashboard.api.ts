import { API_ENDPOINTS } from "@/constants";
import { apiClient } from "@/lib";
import { ApiResponse } from "@/types";
import { DashboardSum } from "@/types/dashboard";

export const dashboardService = {
  dashboard: () =>
    apiClient
      .get<ApiResponse<DashboardSum>>(API_ENDPOINTS.DASHBOARD.SUMMARY)
      .then((r) => r.data),
};
