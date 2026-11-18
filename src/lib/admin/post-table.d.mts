import type { AdminPostRow } from './insights.mjs'

export type TableSortKey = 'title' | 'category' | 'date' | 'views' | 'shares' | 'reactionTotal'
export type TableDirection = 'asc' | 'desc'

export interface TableState {
  query: string
  category: string
  neverViewed: boolean
  sort: TableSortKey
  direction: TableDirection
  page: number
  size: number
}

export type TableAction =
  | { type: 'query'; value: string }
  | { type: 'category'; value: string }
  | { type: 'neverViewed'; value: boolean }
  | { type: 'sort'; value: TableSortKey }
  | { type: 'size'; value: number }
  | { type: 'page'; value: number }
  | { type: 'reset' }
  | { type: 'replace'; value: TableState }

export declare const PAGE_SIZES: readonly number[]
export declare const SORT_KEYS: readonly TableSortKey[]
export declare const DEFAULT_TABLE: Readonly<TableState>
export declare function defaultDirection(key: TableSortKey): TableDirection
export declare function parseTableQuery(search: string): TableState
export declare function serializeTableQuery(state: TableState): string
export declare function tableReducer(state: TableState, action: TableAction): TableState
export declare function filterAndSort(
  posts: AdminPostRow[],
  state: TableState,
  categoryTitles?: ReadonlyMap<string, string>,
): AdminPostRow[]
export declare function paginate(
  rows: AdminPostRow[],
  page: number,
  size: number,
): { rows: AdminPostRow[]; page: number; pageCount: number; start: number; total: number }
export declare function pageWindow(page: number, pageCount: number): Array<number | null>
export declare function pageOfPost(sortedRows: AdminPostRow[], postId: string, size: number): number | null
