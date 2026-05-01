"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  dashboardApi,
  type SalesComparisonFilters,
} from "@/lib/api/dashboard.api"

export function useSalesComparison(
  filters: SalesComparisonFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["dashboard", "sales-comparison", filters],
    queryFn: () => dashboardApi.getSalesComparison(filters),
    enabled,
    placeholderData: keepPreviousData,
  })
}
