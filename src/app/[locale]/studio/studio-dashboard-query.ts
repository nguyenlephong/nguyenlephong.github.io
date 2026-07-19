export type StudioDashboardQueryState = {
  workstreamSearch: string;
  statusFilter: "all" | "healthy" | "watching" | "blocked" | "queued";
  sortMode: "joined" | "name" | "status";
};

export const defaultStudioDashboardQuery: StudioDashboardQueryState = {
  workstreamSearch: "",
  statusFilter: "all",
  sortMode: "joined"
};

const queryKeys = {
  workstreamSearch: "ops_q",
  statusFilter: "ops_status",
  sortMode: "ops_sort"
} as const;

const statusFilters = new Set<StudioDashboardQueryState["statusFilter"]>([
  "all",
  "healthy",
  "watching",
  "blocked",
  "queued"
]);
const sortModes = new Set<StudioDashboardQueryState["sortMode"]>(["joined", "name", "status"]);

export function readStudioDashboardQuery(search: string): StudioDashboardQueryState {
  const params = new URLSearchParams(search);
  const status = params.get(queryKeys.statusFilter) as StudioDashboardQueryState["statusFilter"] | null;
  const sort = params.get(queryKeys.sortMode) as StudioDashboardQueryState["sortMode"] | null;
  return {
    workstreamSearch: params.get(queryKeys.workstreamSearch) ?? defaultStudioDashboardQuery.workstreamSearch,
    statusFilter: status && statusFilters.has(status) ? status : defaultStudioDashboardQuery.statusFilter,
    sortMode: sort && sortModes.has(sort) ? sort : defaultStudioDashboardQuery.sortMode
  };
}

export function writeStudioDashboardQuery(
  search: string,
  state: StudioDashboardQueryState
): string {
  const params = new URLSearchParams(search);
  const normalizedSearch = state.workstreamSearch.trim();

  if (normalizedSearch) params.set(queryKeys.workstreamSearch, normalizedSearch);
  else params.delete(queryKeys.workstreamSearch);
  if (state.statusFilter !== defaultStudioDashboardQuery.statusFilter) {
    params.set(queryKeys.statusFilter, state.statusFilter);
  } else {
    params.delete(queryKeys.statusFilter);
  }
  if (state.sortMode !== defaultStudioDashboardQuery.sortMode) {
    params.set(queryKeys.sortMode, state.sortMode);
  } else {
    params.delete(queryKeys.sortMode);
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export function preserveStudioDashboardQueryParams(
  target: URLSearchParams,
  sourceSearch: string
): void {
  const source = new URLSearchParams(sourceSearch);
  for (const key of Object.values(queryKeys)) {
    const value = source.get(key);
    if (value !== null) target.set(key, value);
  }
}
